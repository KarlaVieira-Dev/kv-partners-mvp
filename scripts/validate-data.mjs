const spreadsheetId =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  process.env.GOOGLE_SHEETS_ACCOUNTS_SPREADSHEET_ID ??
  process.env.GOOGLE_SHEETS_EXECUTIVE_CENTER_SPREADSHEET_ID ??
  "1mM_S-RA7TBK6MC04evhv_U9Y31J0izmsgIhPpn8hBUg";

const expectedRisks = [
  { account: "Nexus Sul", riskLevel: "Critico", riskScore: 85 },
  { account: "Unidade Saber Mais", riskLevel: "Alto", riskScore: 68 },
  { account: "Horizonte Operações", riskLevel: "Medio", riskScore: 42 },
  { account: "TechFlow Campinas", riskLevel: "Baixo", riskScore: 18 },
];

const forbiddenValues = [
  ["Conta", "Gestora", "A"].join(" "),
  `Risk Score ${100}`,
  `Health Score ${42}`,
  `${23} dias`,
];

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const parseCsvRows = (csv) => {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && next === '"' && quoted) {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((item) => item.some((cellValue) => cellValue.trim()));
};

const toRecords = (csv) => {
  const [headers = [], ...rows] = parseCsvRows(csv);
  const normalizedHeaders = headers.map(normalize);

  return rows.map((row) =>
    normalizedHeaders.reduce((record, header, index) => {
      record[header] = row[index]?.trim() ?? "";
      return record;
    }, {}),
  );
};

const toNumber = (value) => {
  const parsed = Number(String(value).replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const readSheet = async (sheet) => {
  const params = new URLSearchParams({ sheet, tqx: "out:csv" });
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${sheet} responded with ${response.status}`);
  }

  return response.text();
};

const [accountsCsv, risksCsv] = await Promise.all([
  readSheet("01_Contas"),
  readSheet("07_IOI_Scores"),
]);
const accounts = toRecords(accountsCsv);
const risks = toRecords(risksCsv);
const accountsById = new Map(accounts.map((account) => [account["id conta"], account]));
const risksByAccountName = new Map(
  risks.map((risk) => {
    const account = accountsById.get(risk["id conta"]);
    return [account?.["nome conta"] ?? risk["id conta"], risk];
  }),
);

for (const expected of expectedRisks) {
  const risk = risksByAccountName.get(expected.account);

  if (!risk) {
    throw new Error(`Missing expected account in 07_IOI_Scores: ${expected.account}`);
  }

  const riskScore = toNumber(risk["risk score"]);
  const riskLevel = normalize(risk["nivel risco"]);

  if (riskScore !== expected.riskScore) {
    throw new Error(
      `${expected.account} risk_score expected ${expected.riskScore}, received ${riskScore}`,
    );
  }

  if (riskLevel !== normalize(expected.riskLevel)) {
    throw new Error(
      `${expected.account} risk level expected ${expected.riskLevel}, received ${risk["nivel risco"]}`,
    );
  }
}

const highRiskCount = risks.filter((risk) => {
  const level = normalize(risk["nivel risco"]);
  return level.includes("alto") || level.includes("critico");
}).length;
const averageRiskScore = Math.round(
  risks.reduce((total, risk) => total + toNumber(risk["risk score"]), 0) /
    Math.max(risks.length, 1),
);
const combinedSheetText = `${accountsCsv}\n${risksCsv}`;

for (const forbidden of forbiddenValues) {
  if (combinedSheetText.includes(forbidden)) {
    throw new Error(`Forbidden legacy value found: ${forbidden}`);
  }
}

console.log(`validate:data OK`);
console.log(`07_IOI_Scores rows: ${risks.length}`);
console.log(`Average risk score: ${averageRiskScore}`);
console.log(`High or critical risk accounts: ${highRiskCount}`);
