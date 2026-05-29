import { parseCsv } from "@/lib/google-sheets/csv";
import type {
  ExecutiveAccountRow,
  ExecutiveAccountsResponse,
} from "@/lib/google-sheets/types";

export const productIntelligenceModules = [
  "Account Onboarding",
  "Feedback Intelligence",
  "Identity & Onboarding Intelligence",
  "Market & Growth Intelligence",
];

const executiveSheets = {
  ioiScores: "07_IOI_Scores",
  mgiInsights: "09_MGI_Insights",
  mgiRecommendations: "10_MGI_Recommendations",
};

type SheetRow = Record<string, string>;

type AccountAccumulator = {
  account: string;
  type: string;
  status: string;
  healthScore?: number;
  riskScore?: number;
  mainReason: string;
  suggestedAction: string;
};

const toNumber = (value: string) => {
  const parsed = Number(value.replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getCell = (row: SheetRow, keys: string[]) => {
  for (const key of keys) {
    if (row[key]) {
      return row[key].trim();
    }
  }

  return "";
};

const getAccountName = (row: SheetRow) =>
  getCell(row, [
    "conta",
    "account",
    "cliente",
    "customer",
    "nome da conta",
    "account name",
    "empresa",
    "organization",
  ]);

const getAccountType = (row: SheetRow) =>
  getCell(row, ["tipo", "type", "segmento", "segment", "categoria"]);

const getStatus = (row: SheetRow) =>
  getCell(row, ["status", "situacao", "stage", "etapa"]);

const getHealthScore = (row: SheetRow) =>
  toNumber(
    getCell(row, [
      "health score",
      "health",
      "ioi score",
      "score ioi",
      "onboarding score",
      "identity score",
      "score",
    ]),
  );

const getRiskScore = (row: SheetRow) =>
  toNumber(
    getCell(row, [
      "risk score",
      "risk",
      "risco",
      "score risco",
      "operational risk",
      "risco operacional",
    ]),
  );

const getInsightText = (row: SheetRow) =>
  getCell(row, [
    "motivo principal",
    "insight",
    "insight principal",
    "mgi insight",
    "descricao",
    "description",
    "observacao",
    "signal",
    "sinal",
  ]);

const getRecommendationText = (row: SheetRow) =>
  getCell(row, [
    "acao sugerida",
    "recommendation",
    "recomendacao",
    "mgi recommendation",
    "acao",
    "action",
    "next step",
    "proxima acao",
  ]);

const riskFromHealth = (healthScore: number) =>
  Math.max(0, Math.min(100, 100 - healthScore));

const deriveStatus = (account: AccountAccumulator) => {
  if (account.status) {
    return account.status;
  }

  const riskScore = account.riskScore ?? riskFromHealth(account.healthScore ?? 0);

  if (riskScore >= 70) {
    return "Em risco";
  }

  if ((account.healthScore ?? 0) >= 85) {
    return "Expansao potencial";
  }

  return "Monitoramento ativo";
};

const upsertAccount = (
  accountsByName: Map<string, AccountAccumulator>,
  accountName: string,
) => {
  const existing = accountsByName.get(accountName);

  if (existing) {
    return existing;
  }

  const account: AccountAccumulator = {
    account: accountName,
    type: "",
    status: "",
    mainReason: "",
    suggestedAction: "",
  };

  accountsByName.set(accountName, account);
  return account;
};

const spreadsheetId = () =>
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  process.env.GOOGLE_SHEETS_ACCOUNTS_SPREADSHEET_ID ??
  process.env.GOOGLE_SHEETS_EXECUTIVE_CENTER_SPREADSHEET_ID;

const buildGoogleSheetsCsvUrl = (sheetName: string) => {
  const id = spreadsheetId();

  if (!id) {
    return null;
  }

  const params = new URLSearchParams({
    sheet: sheetName,
    tqx: "out:csv",
  });

  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?${params.toString()}`;
};

const readSheet = async (sheetName: string) => {
  const csvUrl = buildGoogleSheetsCsvUrl(sheetName);

  if (!csvUrl) {
    return [];
  }

  const response = await fetch(csvUrl, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(
      `Google Sheets tab ${sheetName} responded with ${response.status}`,
    );
  }

  return parseCsv(await response.text());
};

const applyIoiScores = (
  accountsByName: Map<string, AccountAccumulator>,
  rows: SheetRow[],
) => {
  for (const row of rows) {
    const accountName = getAccountName(row);

    if (!accountName) {
      continue;
    }

    const account = upsertAccount(accountsByName, accountName);
    const healthScore = getHealthScore(row);
    const riskScore = getRiskScore(row);

    account.type ||= getAccountType(row);
    account.status ||= getStatus(row);

    if (healthScore !== undefined) {
      account.healthScore = healthScore;
    }

    if (riskScore !== undefined) {
      account.riskScore = riskScore;
    }
  }
};

const applyMgiInsights = (
  accountsByName: Map<string, AccountAccumulator>,
  rows: SheetRow[],
) => {
  for (const row of rows) {
    const accountName = getAccountName(row);

    if (!accountName) {
      continue;
    }

    const account = upsertAccount(accountsByName, accountName);
    const insight = getInsightText(row);
    const riskScore = getRiskScore(row);

    account.type ||= getAccountType(row);
    account.status ||= getStatus(row);
    account.mainReason ||= insight;

    if (riskScore !== undefined) {
      account.riskScore = Math.max(account.riskScore ?? 0, riskScore);
    }
  }
};

const applyMgiRecommendations = (
  accountsByName: Map<string, AccountAccumulator>,
  rows: SheetRow[],
) => {
  for (const row of rows) {
    const accountName = getAccountName(row);

    if (!accountName) {
      continue;
    }

    const account = upsertAccount(accountsByName, accountName);
    const recommendation = getRecommendationText(row);

    account.type ||= getAccountType(row);
    account.status ||= getStatus(row);
    account.suggestedAction ||= recommendation;
  }
};

const toExecutiveAccount = (
  account: AccountAccumulator,
): ExecutiveAccountRow => {
  const healthScore = account.healthScore ?? 0;
  const riskScore = account.riskScore ?? riskFromHealth(healthScore);

  return {
    account: account.account,
    type: account.type || "Conta",
    healthScore,
    riskScore,
    status: deriveStatus({ ...account, healthScore, riskScore }),
    mainReason: account.mainReason || "Sem insight registrado",
    suggestedAction: account.suggestedAction || "Sem recomendacao registrada",
  };
};

export async function getExecutiveAccountsFromSheets(): Promise<ExecutiveAccountsResponse> {
  if (!spreadsheetId()) {
    return {
      accounts: [],
      source: "not-configured",
      modules: productIntelligenceModules,
    };
  }

  try {
    const [ioiScores, mgiInsights, mgiRecommendations] = await Promise.all([
      readSheet(executiveSheets.ioiScores),
      readSheet(executiveSheets.mgiInsights),
      readSheet(executiveSheets.mgiRecommendations),
    ]);
    const accountsByName = new Map<string, AccountAccumulator>();

    applyIoiScores(accountsByName, ioiScores);
    applyMgiInsights(accountsByName, mgiInsights);
    applyMgiRecommendations(accountsByName, mgiRecommendations);

    return {
      accounts: Array.from(accountsByName.values()).map(toExecutiveAccount),
      source: "google-sheets",
      modules: productIntelligenceModules,
    };
  } catch (error) {
    console.error("Failed to read KV Partners Google Sheets modules", error);

    return {
      accounts: [],
      source: "not-configured",
      modules: productIntelligenceModules,
    };
  }
}
