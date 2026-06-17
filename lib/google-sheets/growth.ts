import { parseCsvWithMetadata } from "@/lib/google-sheets/csv";
import type {
  GrowthBenchmarkRow,
  GrowthCompetitiveRadarRow,
  GrowthInsightRow,
  GrowthJtbdRow,
  GrowthMarketTrendRow,
  GrowthRadar,
  GrowthRecommendationRow,
  GrowthResponse,
} from "@/lib/google-sheets/types";

type SheetRow = Record<string, string>;

const spreadsheetId = () =>
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  "1mM_S-RA7TBK6MC04evhv_U9Y31J0izmsgIhPpn8hBUg";

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
  const params = new URLSearchParams({ sheet: sheetName, tqx: "out:csv" });
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId()}/gviz/tq?${params.toString()}`;
};

const readSheet = async (sheetName: string) => {
  const response = await fetch(buildSheetCsvUrl(sheetName), {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) throw new Error(`${sheetName} responded with ${response.status}`);
  return parseCsvWithMetadata(await response.text()).records;
};

const readOptionalSheet = async (sheetName: string) => {
  try {
    return await readSheet(sheetName);
  } catch (error) {
    console.warn(`Failed to read optional growth sheet ${sheetName}`, error);
    return [];
  }
};

const readFirstAvailableSheet = async (sheetNames: string[]) => {
  for (const sheetName of sheetNames) {
    const rows = await readOptionalSheet(sheetName);
    if (rows.length > 0) return rows;
  }
  return [];
};

const buildAccountNames = (accounts: SheetRow[]) =>
  new Map(accounts.map((a) => [getCell(a, ["id conta"]), getCell(a, ["nome conta"])]));

const buildCategoryAccounts = (jtbdRows: SheetRow[], accountNames: Map<string, string>) => {
  const categoryAccounts = new Map<string, string>();
  for (const row of jtbdRows) {
    const category = getCell(row, ["categoria job"]);
    const accountName = accountNames.get(getCell(row, ["id conta"])) || getCell(row, ["id conta"]);
    if (category && accountName && !categoryAccounts.has(category)) {
      categoryAccounts.set(category, accountName);
    }
  }
  return categoryAccounts;
};

const priorityFromFriction = (friction: string) => {
  const n = friction.toLowerCase();
  if (n.includes("alta")) return "Alta";
  if (n.includes("media") || n.includes("média")) return "Media";
  return "Baixa";
};

const classifyRadar = (text: string): keyof GrowthRadar => {
  const n = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (n.includes("expans") || n.includes("growth") || n.includes("cross") || n.includes("upsell")) return "expansion";
  if (n.includes("eficien") || n.includes("operacional") || n.includes("permiss") || n.includes("autom")) return "operationalEfficiency";
  return "retention";
};

const buildRadar = (
  jtbd: GrowthJtbdRow[],
  insights: GrowthInsightRow[],
  recommendations: GrowthRecommendationRow[],
  marketTrends: GrowthMarketTrendRow[],
  competitiveRadar: GrowthCompetitiveRadarRow[],
  benchmarks: GrowthBenchmarkRow[],
) => {
  const radar: GrowthRadar = { expansion: 0, operationalEfficiency: 0, retention: 0 };
  for (const item of [
    ...jtbd.map((r) => `${r.job} ${r.category}`),
    ...insights.map((r) => `${r.insight} ${r.category}`),
    ...recommendations.map((r) => r.recommendation),
    ...marketTrends.map((r) => `${r.theme} ${r.category}`),
    ...competitiveRadar.map((r) => `${r.movement} ${r.category}`),
    ...benchmarks.map((r) => `${r.metric} ${r.category}`),
  ]) {
    radar[classifyRadar(item)] += 1;
  }
  return radar;
};
export async function getGrowthFromSheets(): Promise<GrowthResponse> {
  if (!spreadsheetId()) {
    return {
      benchmarks: [],
      competitiveRadar: [],
      insights: [],
      jtbd: [],
      marketTrends: [],
      radar: { expansion: 0, operationalEfficiency: 0, retention: 0 },
      recommendations: [],
      source: "not-configured",
    };
  }
  try {
    const [accounts, jtbdRows, insightRows, recommendationRows, marketTrendRows, competitiveRadarRows, benchmarkRows] =
      await Promise.all([
        readSheet("01_Contas"),
        readSheet("08_MGI_JTBD"),
        readSheet("09_MGI_Insights"),
        readSheet("10_MGI_Recommendations"),
        readOptionalSheet("11_MGI_Market_Trends"),
        readOptionalSheet("12_MGI_Competitive_Radar"),
        readFirstAvailableSheet(["13_MGI_Benchmark", "13_MGI_Benchmarks"]),
      ]);

    const accountNames = buildAccountNames(accounts);
    const categoryAccounts = buildCategoryAccounts(jtbdRows, accountNames);

    const jtbd: GrowthJtbdRow[] = jtbdRows.map((row) => {
      const accountId = getCell(row, ["id conta"]);
      const category = getCell(row, ["categoria job"]);
      const friction = getCell(row, ["nivel friccao"]);
      return {
        accountId,
        accountName: accountNames.get(accountId) || accountId,
        category,
        frequency: jtbdRows.filter((c) => getCell(c, ["categoria job"]) === category).length,
        id: getCell(row, ["id jtbd"]),
        impact: getCell(row, ["impacto estimado"]),
        job:
