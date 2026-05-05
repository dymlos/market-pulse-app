type DataTablePreviewProps = {
  columns: string[];
  rows: string[][];
};

export function DataTablePreview({ columns, rows }: DataTablePreviewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-left">
          <thead className="bg-panel-raised">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel">
            {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`}>
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
