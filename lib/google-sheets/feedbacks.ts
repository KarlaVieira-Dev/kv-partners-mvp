import { parseCsvWithMetadata } from "@/lib/google-sheets/csv";
import type { FeedbackRow, FeedbacksResponse } from "@/lib/google-sheets/types";

type SheetRow = Record<string, string>;

const spreadsheetId = () =>
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  process.env.GOOGLE_SHEETS_ACCOUNTS_SPREADSHEET_ID ??
  process.env.GOOGLE_SHEETS_EXECUTIVE_CENTER_SPREADSHEET_ID ??
  "1mM_S-RA7TBK6MC04evhv_U9Y31J0izmsgIhPpn8hBUg";

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
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`${sheetName} responded with ${response.status}`);
  }

  return parseCsvWithMetadata(await response.text()).records;
};

export async function getFeedbacksFromSheets(): Promise<FeedbacksResponse> {
  if (!spreadsheetId()) {
    return {
      feedbacks: [],
      source: "not-configured",
    };
  }

  try {
    const [accounts, feedbacks] = await Promise.all([
      readSheet("01_Contas"),
      readSheet("06_Feedbacks"),
    ]);
    const accountNames = new Map(
      accounts.map((account) => [
        getCell(account, ["id conta"]),
        getCell(account, ["nome conta"]),
      ]),
    );

    return {
      feedbacks: feedbacks.map((feedback): FeedbackRow => {
        const accountId = getCell(feedback, ["id conta"]);

        return {
          accountId,
          accountName: accountNames.get(accountId) || accountId,
          category: getCell(feedback, ["categoria"]),
          date: getCell(feedback, ["data feedback"]),
          id: getCell(feedback, ["id feedback"]),
          priority: getCell(feedback, ["criticidade"]),
          sentiment: getCell(feedback, ["sentimento"]),
          status: getCell(feedback, ["status feedback"]),
          summary: getCell(feedback, ["resumo"]),
          theme: getCell(feedback, ["tema"]),
        };
      }),
      source: "google-sheets",
    };
  } catch (error) {
    console.error("Failed to read KV Partners feedback sheets", error);

    return {
      feedbacks: [],
      source: "not-configured",
    };
  }
}
