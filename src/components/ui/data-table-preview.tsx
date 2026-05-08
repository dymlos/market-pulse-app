type DataTablePreviewProps = {
  columns: string[];
  rows: string[][];
};

export function DataTablePreview({ columns, rows }: DataTablePreviewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line/80 bg-panel/75">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-left">
          <thead className="bg-panel-raised/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/80 bg-transparent">
            {rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`} className="transition hover:bg-panel-raised/55">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${row[0]}-${cellIndex}`}
                    className="px-4 py-3 text-sm leading-6 text-ink"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
