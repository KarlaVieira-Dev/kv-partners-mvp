const normalizeHeader = (header: string) =>
  header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const parseCsvRows = (csv: string) => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let isQuoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const nextChar = csv[index + 1];

    if (char === '"' && nextChar === '"' && isQuoted) {
      currentCell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      isQuoted = !isQuoted;
      continue;
    }

    if (char === "," && !isQuoted) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !isQuoted) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
};

export function parseCsvWithMetadata(csv: string) {
  const rows = parseCsvRows(csv);
  const [headers = [], ...dataRows] = rows.filter((row) =>
    row.some((cell) => cell.trim()),
  );

  const normalizedHeaders = headers.map(normalizeHeader);
  const records = dataRows.map((row) =>
    headers.reduce<Record<string, string>>((record, header, index) => {
      record[normalizeHeader(header)] = row[index]?.trim() ?? "";
      return record;
    }, {}),
  );

  return {
    headers,
    normalizedHeaders,
    records,
  };
}

export function parseCsv(csv: string) {
  return parseCsvWithMetadata(csv).records;
}
