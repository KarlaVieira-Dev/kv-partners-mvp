import { parseCsvWithMetadata } from "@/lib/google-sheets/csv";
import type { RiskRow, RisksResponse } from "@/lib/google-sheets/types";
import type { RiskLevel } from "@/lib/constants/ioi";

type SheetRow = Record<string, string>;

// Consolidado: usa apenas GOOGLE_SHEETS_SPREADSHEET_ID
// As variáveis ACCOUNTS e EXECUTIVE_CENTER foram descontinuadas
const spreadsheetId = () =>
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  "1mM_S-RA7TBK6MC04evhv_U9Y31J0izmsgIhPpn8hBUg";

// Scores IOI são atualizados diariamente — 5 min de cache é suficiente
const REVALIDATE_SECONDS = 300;

const toNumber = (value: string) => {
  const parsed = Number(value.replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getCell = (row: SheetRow, keys: string[]) => {
  for (const key of keys) {
    if (row[key]) {
      return row[key].trim();
    }
  }
  return "";
};

const buildSheetCsvUrl = (sheetName: string) => {
  const params = new URLSearchParams({
    sheet: sheetName,
    tqx: "out:csv",
  });
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId()}/gviz/tq?${params.toString()}`;
};

const readSheet = async (sheetName: string) => {
  const response = await fetch(buildSheetCsvUrl(sheetName), {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`${sheetName} responded with ${response.status}`);
  }

  return parseCsvWithMetadata(await response.text()).records;
};

export async function getRisksFromSheets(): Promise<RisksResponse> {
  if (!spreadsheetId()) {
    return {
      risks: [],
      source: "not-configured",
    };
  }

  try {
    const [accounts, scores] = await Promise.all([
      readSheet("01_Contas"),
      readSheet("07_IOI_Scores"),
    ]);

    const accountsById = new Map(
      accounts.map((account) => [getCell(account, ["id conta"]), account]),
    );

    return {
      risks: scores.map((score): RiskRow => {
        const accountId = getCell(score, ["id conta"]);
        const account = accountsById.get(accountId);

        return {
          accessScore: toNumber(getCell(score, ["access score"])),
          accountId,
          accountName: getCell(account ?? {}, ["nome conta"]) || accountId,
          accountStatus: getCell(account ?? {}, ["status conta"]),
          accountType: getCell(account ?? {}, ["tipo conta"]),
          feedbackScore: toNumber(getCell(score, ["feedback score"])),
          healthLevel: getCell(score, ["nivel saude"]),
          healthScore: toNumber(getCell(score, ["health score"])),
          mainReason: getCell(score, ["motivo principal"]),
          onboardingScore: toNumber(getCell(score, ["onboarding score"])),
          riskLevel: getCell(score, ["nivel risco"]) as RiskLevel,
          riskScore: toNumber(getCell(score, ["risk score"])),
          suggestedAction: getCell(score, ["acao sugerida"]),
          usageScore: toNumber(getCell(score, ["usage score"])),
        };
      }),
      source: "google-sheets",
    };
  } catch (error) {
    console.error("Failed to read KV Partners risk sheets", error);

    return {
      risks: [],
      source: "not-configured",
    };
  }
}
