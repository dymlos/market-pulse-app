export type CsvParseError = {
  rowNumber?: number;
  message: string;
};

export type CsvParsedRow = {
  rowNumber: number;
  values: Record<string, string>;
  cells: string[];
};

export type CsvParseResult = {
  delimiter: string;
  headers: string[];
  rows: CsvParsedRow[];
  errors: CsvParseError[];
};

const DELIMITERS = [",", ";", "\t"] as const;

function stripByteOrderMark(value: string) {
  return value.replace(/^\uFEFF/, "");
}

function countDelimiterOutsideQuotes(line: string, delimiter: string) {
  let count = 0;
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      count += 1;
    }
  }

  return count;
}

function detectDelimiter(text: string) {
  const firstDataLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
  let selected = ",";
  let selectedCount = -1;

  for (const delimiter of DELIMITERS) {
    const count = countDelimiterOutsideQuotes(firstDataLine, delimiter);
    if (count > selectedCount) {
      selected = delimiter;
      selectedCount = count;
    }
  }

  return selected;
}

function parseRecords(text: string, delimiter: string) {
  const records: string[][] = [];
  let record: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === '"') {
      if (inQuotes && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      record.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[index + 1] === "\n") {
        index += 1;
      }

      record.push(cell);
      records.push(record);
      record = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || record.length > 0) {
    record.push(cell);
    records.push(record);
  }

  return { records, hasOpenQuote: inQuotes };
}

function buildUniqueHeaders(rawHeaders: string[]) {
  const seen = new Map<string, number>();

  return rawHeaders.map((rawHeader, index) => {
    const baseHeader = stripByteOrderMark(rawHeader).trim() || `columna_${index + 1}`;
    const occurrences = seen.get(baseHeader) ?? 0;
    seen.set(baseHeader, occurrences + 1);

    return occurrences === 0 ? baseHeader : `${baseHeader} (${occurrences + 1})`;
  });
}

export function parseCsv(text: string): CsvParseResult {
  const cleanText = stripByteOrderMark(text).replace(/\u0000/g, "");
  const delimiter = detectDelimiter(cleanText);
  const { records, hasOpenQuote } = parseRecords(cleanText, delimiter);
  const errors: CsvParseError[] = [];

  if (hasOpenQuote) {
    errors.push({ message: "El CSV tiene comillas sin cerrar." });
  }

  const firstRecord = records.find((record) => record.some((cell) => cell.trim().length > 0));
  if (!firstRecord) {
    return { delimiter, headers: [], rows: [], errors: [{ message: "El CSV esta vacio." }] };
  }

  const firstRecordIndex = records.indexOf(firstRecord);
  const headers = buildUniqueHeaders(firstRecord);
  const dataRecords = records.slice(firstRecordIndex + 1);
  const rows: CsvParsedRow[] = [];

  dataRecords.forEach((record, index) => {
    const rowNumber = firstRecordIndex + index + 2;
    const isEmpty = record.every((cell) => cell.trim().length === 0);

    if (isEmpty) {
      return;
    }

    if (record.length !== headers.length) {
      errors.push({
        rowNumber,
        message: `La fila tiene ${record.length} columnas; se esperaban ${headers.length}.`,
      });
    }

    const values = headers.reduce<Record<string, string>>((accumulator, header, headerIndex) => {
      accumulator[header] = (record[headerIndex] ?? "").trim();
      return accumulator;
    }, {});

    rows.push({
      rowNumber,
      values,
      cells: headers.map((_, headerIndex) => (record[headerIndex] ?? "").trim()),
    });
  });

  return { delimiter, headers, rows, errors };
}
