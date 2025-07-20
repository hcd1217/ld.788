export interface ExportColumn<T> {
  readonly key: keyof T | string;
  readonly label: string;
  readonly getValue?: (item: T) => string | number | boolean;
}

/**
 * Escapes special characters in CSV values
 */
function escapeCsvValue(value: string): string {
  // If value contains comma, quotes, or newline, wrap in quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Escape quotes by doubling them
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

/**
 * Converts data to CSV format
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: readonly T[],
  columns: ReadonlyArray<ExportColumn<T>>,
): string {
  if (data.length === 0) {
    return '';
  }

  // Create header row
  const headers = columns.map((col) => escapeCsvValue(col.label));
  const csvRows = [headers.join(',')];

  // Create data rows
  for (const item of data) {
    const values = columns.map((col) => {
      let value: unknown;

      if (col.getValue) {
        value = col.getValue(item);
      } else {
        // Use key to access the value
        const keys = (col.key as string).split('.');
        value = keys.reduce((obj: any, key) => obj?.[key], item);
      }

      // Convert value to string
      if (value === null || value === undefined) {
        return '';
      }

      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }

      if (Array.isArray(value)) {
        return value.join('; ');
      }

      if (typeof value === 'object') {
        return JSON.stringify(value);
      }

      if (typeof value === 'string' || typeof value === 'number') {
        return escapeCsvValue(String(value));
      }

      return escapeCsvValue(JSON.stringify(value));
    });

    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Downloads a file with the given content
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType = 'text/plain',
): void {
  const blob = new Blob([content], {type: mimeType});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Exports data to CSV file
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: readonly T[],
  columns: ReadonlyArray<ExportColumn<T>>,
  filename: string,
): void {
  const csv = convertToCSV(data, columns);
  const timestamp = new Date().toISOString().slice(0, 19).replaceAll(':', '-');
  const filenameWithTimestamp = `${filename}_${timestamp}.csv`;
  downloadFile(csv, filenameWithTimestamp, 'text/csv;charset=utf-8');
}
