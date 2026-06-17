import { parseCsvWithMetadata } from "@/lib/google-sheets/csv";
import type {
  ExecutiveAccountRow,
  ExecutiveAccountsResponse,
} from "@/lib/google-sheets/types";
import { IOI_RISK_THRESHOLDS } from "@/lib/constants/ioi";

export const productIntelligenceModules = [
  "Account Onboarding",
  "Feedback Intelligence",
  "Identity & Onboarding Intelligence",
  "Market & Growth Intelligence",
];

const executiveSheets = {
  accounts: "01_Contas",
  ioiScores: "07_IOI_Scores",
  mgiInsights: "09_MGI_Insights",
  mgiRecommendations: "10_MGI_Recommendations",
};

type SheetRow = Record<string, string>;
type SheetReadDebug = NonNullable<ExecutiveAccountsResponse["debug"]>["sheets"][number];
type SheetReadResult = {
  debug: SheetReadDebug;
  rows: SheetRow[];
};
type AccountAccumulator = {
  id: string;
  account: string;
  city: string;
  type: string;
  plan: string;
  segment: string;
  status: string;
  state: string;
  size: string;
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

const getAccountId = (row: SheetRow) =>
  getCell(row, [
    "id conta",
    "account id",
    "id account",
    "id cliente",
    "cliente id",
    "id",
  ]);

const getAccountName = (row: SheetRow) =>
  getCell(row, [
    "nome conta",
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
  getCell(row, [
    "tipo conta",
    "tipo",
    "type",
    "segmento",
    "segment",
    "categoria",
  ]);

const getSegment = (row: SheetRow) =>
  getCell(row, ["segmento", "segment"]);

const getSize = (row: SheetRow) =>
  getCell(row, ["porte", "size", "company size"]);

const getStatus = (row: SheetRow) =>
  getCell(row, [
    "status conta",
    "status",
    "situacao",
    "stage",
    "etapa",
  ]);

const getPlan = (row: SheetRow) => getCell(row, ["plano", "plan"]);
const getCity = (row: SheetRow) => getCell(row, ["cidade", "city"]);
const getState = (row: SheetRow) => getCell(row, ["estado", "state", "uf"]);

const getHealthScore = (row: SheetRow) =>
  toNumber(
    getCell(row, [
      "health score",
      "health_score",
      "healthscore",
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
      "risk_score",
      "riskscore",
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
    "motivo_principal",
    "motivoprincipal",
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
    "acao_sugerida",
    "acaosugerida",
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
  // Alinhado com IOI_RISK_THRESHOLDS.ALTO — contas com risco Alto ou Crítico
  if (riskScore >= IOI_RISK_THRESHOLDS.ALTO.min) {
    return "Em risco";
  }
  if ((account.healthScore ?? 0) >= 85) {
    return "Expansao potencial";
  }
  return "Monitoramento ativo";
};

const upsertAccount = (
  accountsByKey: Map<string, AccountAccumulator>,
  aliases: Map<string, string>,
  row: SheetRow,
) => {
  const accountId = getAccountId(row);
  const accountName = getAccountName(row);
  const lookupKeys = [accountId, accountName].filter(Boolean);
  for (const lookupKey of lookupKeys) {
    const canonicalKey = aliases.get(lookupKey) ?? lookupKey;
    const existing = accountsByKey.get(canonicalKey);
    if (existing) {
      return existing;
    }
  }
  if (!accountName && !accountId) {
    return null;
  }
  const canonicalKey = accountId || accountName;
  const account: AccountAccumulator = {
    id: accountId,
    account: accountName || accountId,
    city: "",
    type: "",
    plan: "",
    segment: "",
    status: "",
    state: "",
    size: "",
    mainReason: "",
    suggestedAction: "",
  };
  accountsByKey.set(canonicalKey, account);
  for (const lookupKey of lookupKeys) {
    aliases.set(lookupKey, canonicalKey);
  }
  return account;
};

const findAccount = (
  accountsByKey: Map<string, AccountAccumulator>,
  aliases: Map<string, string>,
  row: SheetRow,
) => {
  const lookupKeys = [getAccountId(row), getAccountName(row)].filter(Boolean);
  for (const lookupKey of lookupKeys) {
    const canonicalKey = aliases.get(lookupKey) ?? lookupKey;
    const account = accountsByKey.get(canonicalKey);
    if (account) {
      return account;
    }
  }
  return null;
};

const applyPrimaryAccounts = (
  accountsByKey: Map<string, AccountAccumulator>,
  aliases: Map<string, string>,
  rows: SheetRow[],
) => {
  for (const row of rows) {
    const account = upsertAccount(accountsByKey, aliases, row);
    const healthScore = getHealthScore(row);
    if (!account) {
      continue;
    }
    account.type = getAccountType(row) || account.type;
    account.segment = getSegment(row) || account.segment;
    account.size = getSize(row) || account.size;
    account.status = getStatus(row) || account.status;
    account.plan = getPlan(row) || account.plan;
    account.city = getCity(row) || account.city;
    account.state = getState(row) || account.state;
    if (healthScore !== undefined) {
      account.healthScore = healthScore;
    }
  }
};

// Consolidado: usa apenas GOOGLE_SHEETS_SPREADSHEET_ID
const spreadsheetId = () =>
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  "1mM_S-RA7TBK6MC04evhv_U9Y31J0izmsgIhPpn8hBUg";

const buildGoogleSheetsCsvUrl = ({
  gid,
  sheetName,
}: {
  gid?: string;
  sheetName?: string;
}) => {
  const id = spreadsheetId();
  if (!id) {
    return null;
  }
  if (gid) {
    const params = new URLSearchParams({ format: "csv", gid });
    return `https://docs.google.com/spreadsheets/d/${id}/export?${params.toString()}`;
  }
  if (sheetName) {
    const params = new URLSearchParams({
      sheet: sheetName,
      tqx: "out:csv",
    });
    return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?${params.toString()}`;
  }
  return null;
};

const readSheet = async (
  sheetName: string,
  attempts: Array<{ gid?: string; sheetName?: string }>,
): Promise<SheetReadResult> => {
  const debug: SheetReadDebug = {
    sheet: sheetName,
    attempts: [],
  };
  for (const attempt of attempts) {
    const csvUrl = buildGoogleSheetsCsvUrl(attempt);
    if (!csvUrl) {
      continue;
    }
    try {
      const response = await fetch(csvUrl, {
        next: { revalidate: 300 },
      });
      if (!response.ok) {
        debug.attempts.push({
          error: `HTTP ${response.status}`,
          headers: [],
          normalizedHeaders: [],
          rowCount: 0,
          status: response.status,
          url: csvUrl,
        });
        continue;
      }
      const parsed = parseCsvWithMetadata(await response.text());
      debug.attempts.push({
        headers: parsed.headers,
        normalizedHeaders: parsed.normalizedHeaders,
        rowCount: parsed.records.length,
        status: response.status,
        url: csvUrl,
      });
      if (parsed.records.length > 0) {
        return {
          debug,
          rows: parsed.records,
        };
      }
    } catch (error) {
      debug.attempts.push({
        error: error instanceof Error ? error.message : "Unknown fetch error",
        headers: [],
        normalizedHeaders: [],
        rowCount: 0,
        url: csvUrl,
      });
    }
  }
  return {
    debug,
    rows: [],
  };
};

const applyIoiScores = (
  accountsByKey: Map<string, AccountAccumulator>,
  aliases: Map<string, string>,
  rows: SheetRow[],
) => {
  for (const row of rows) {
    const account = findAccount(accountsByKey, aliases, row);
    const healthScore = getHealthScore(row);
    const riskScore = getRiskScore(row);
    if (!account) {
      continue;
    }
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
  accountsByKey: Map<string, AccountAccumulator>,
  aliases: Map<string, string>,
  rows: SheetRow[],
) => {
  for (const row of rows) {
    const account = findAccount(accountsByKey, aliases, row);
    const insight = getInsightText(row);
    if (!account) {
      continue;
    }
    // MGI fornece apenas insights e recomendações.
    // Risk score vem exclusivamente do IOI (applyIoiScores).
    account.type ||= getAccountType(row);
    account.status ||= getStatus(row);
    account.mainReason ||= insight;
  }
};

const applyMgiRecommendations = (
  accountsByKey: Map<string, AccountAccumulator>,
  aliases: Map<string, string>,
  rows: SheetRow[],
) => {
  for (const row of rows) {
    const account = findAccount(accountsByKey, aliases, row);
    const recommendation = getRecommendationText(row);
    if (!account) {
      continue;
    }
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
    city: account.city,
    type: account.type || "Conta",
    plan: account.plan,
    segment: account.segment,
    healthScore,
    riskScore,
    state: account.state,
    status: deriveStatus({ ...account, healthScore, riskScore }),
    size: account.size,
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
  const [accountsSheet, ioiScoresSheet, mgiInsightsSheet, recommendationsSheet] =
    await Promise.all([
      readSheet(executiveSheets.accounts, [
        { gid: "0" },
        { sheetName: executiveSheets.accounts },
      ]),
      readSheet(executiveSheets.ioiScores, [
        { sheetName: executiveSheets.ioiScores },
      ]),
      readSheet(executiveSheets.mgiInsights, [
        { sheetName: executiveSheets.mgiInsights },
      ]),
      readSheet(executiveSheets.mgiRecommendations, [
        { sheetName: executiveSheets.mgiRecommendations },
      ]),
    ]);

  const accountsByKey = new Map<string, AccountAccumulator>();
  const aliases = new Map<string, string>();

  applyPrimaryAccounts(accountsByKey, aliases, accountsSheet.rows);
  applyIoiScores(accountsByKey, aliases, ioiScoresSheet.rows);
  applyMgiInsights(accountsByKey, aliases, mgiInsightsSheet.rows);
  applyMgiRecommendations(accountsByKey, aliases, recommendationsSheet.rows);

  const accounts = Array.from(accountsByKey.values()).map(toExecutiveAccount);
  const debug = {
    sheets: [
      accountsSheet.debug,
      ioiScoresSheet.debug,
      mgiInsightsSheet.debug,
      recommendationsSheet.debug,
    ],
  };

  return {
    accounts,
    ...(accounts.length === 0 ? { debug } : {}),
    source: "google-sheets",
    modules: productIntelligenceModules,
  };
}
