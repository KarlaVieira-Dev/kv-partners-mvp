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
  if (!response.ok) {
    throw new Error(`${sheetName} responded with ${response.status}`);
  }
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
    if (rows.length > 0) {
      return rows;
    }
  }
  return [];
};

const buildAccountNames = (accounts: SheetRow[]) =>
  new Map(
    accounts.map((account) => [
      getCell(account, ["id conta"]),
      getCell(account, ["nome conta"]),
    ]),
  );

const buildCategoryAccounts = (
  jtbdRows: SheetRow[],
  accountNames: Map<string, string>,
) => {
  const categoryAccounts = new Map<string, string>();
  for (const row of jtbdRows) {
    const category = getCell(row, ["categoria job"]);
    const accountName =
      accountNames.get(getCell(row, ["id conta"])) || getCell(row, ["id conta"]);
    if (category && accountName && !categoryAccounts.has(category)) {
      categoryAccounts.set(category, accountName);
    }
  }
  return categoryAccounts;
};

const priorityFromFriction = (friction: string) => {
  const normalized = friction.toLowerCase();
  if (normalized.includes("alta")) {
    return "Alta";
  }
  if (normalized.includes("media") || normalized.includes("média")) {
    return "Media";
  }
  return "Baixa";
};

const classifyRadar = (text: string): keyof GrowthRadar => {
  const normalized = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  if (
    normalized.includes("expans") ||
    normalized.includes("growth") ||
    normalized.includes("cross") ||
    normalized.includes("upsell")
  ) {
    return "expansion";
  }
  if (
    normalized.includes("eficien") ||
    normalized.includes("operacional") ||
    normalized.includes("permiss") ||
    normalized.includes("autom")
  ) {
    return "operationalEfficiency";
  }
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
  const radar: GrowthRadar = {
    expansion: 0,
    operationalEfficiency: 0,
    retention: 0,
  };
  for (const item of [
    ...jtbd.map((row) => `${row.job} ${row.category}`),
    ...insights.map((row) => `${row.insight} ${row.category}`),
    ...recommendations.map((row) => row.recommendation),
    ...marketTrends.map((row) => `${row.theme} ${row.category}`),
    ...competitiveRadar.map((row) => `${row.movement} ${row.category}`),
    ...benchmarks.map((row) => `${row.metric} ${row.category}`),
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
    const [
      accounts,
      jtbdRows,
      insightRows,
      recommendationRows,
      marketTrendRows,
      competitiveRadarRows,
      benchmarkRows,
    ] = await Promise.all([
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
        frequency: jtbdRows.filter(
          (candidate) => getCell(candidate, ["categoria job"]) === category,
        ).length,
        id: getCell(row, ["id jtbd"]),
        impact: getCell(row, ["impacto estimado"]),
        job: getCell(row, ["job funcional"]),
        priority: priorityFromFriction(friction),
        status: getCell(row, ["status job"]),
      };
    });

    const insights: GrowthInsightRow[] = insightRows.map((row) => {
      const category = getCell(row, ["categoria insight"]);
      return {
        accountName: categoryAccounts.get(category) || "Portfolio KV",
        category,
        date: getCell(row, ["data insight"]),
        id: getCell(row, ["id insight"]),
        impact: getCell(row, ["impacto negocio"]),
        insight: getCell(row, ["titulo insight"]),
        priority: getCell(row, ["nivel prioridade"]),
        status: getCell(row, ["status insight"]),
      };
    });

    const recommendations: GrowthRecommendationRow[] = recommendationRows.map(
      (row) => ({
        area: getCell(row, ["area responsavel"]),
        estimatedImpact: getCell(row, ["impacto estimado"]),
        id: getCell(row, ["id recommendation"]),
        opportunityScore: toNumber(getCell(row, ["strategic priority score"])),
        priority: getCell(row, ["prioridade"]),
        recommendation: getCell(row, ["recomendacao"]),
        status: getCell(row, ["status recomendacao"]),
      }),
    );

    const marketTrends: GrowthMarketTrendRow[] = marketTrendRows.map(
      (row, index) => ({
        category: getCell(row, ["categoria", "categoria tendencia"]),
        direction: getCell(row, ["direcao", "direcao tendencia", "direction"]),
        id:
          getCell(row, ["id trend", "id tendencia", "id market trend"]) ||
          `market-trend-${index + 1}`,
        impact: getCell(row, ["impacto", "impacto mercado"]),
        priority: getCell(row, ["prioridade", "nivel prioridade"]),
        source: getCell(row, ["fonte", "source"]),
        theme: getCell(row, ["tema", "tema tendencia", "tendencia", "trend"]),
      }),
    );

    const competitiveRadar: GrowthCompetitiveRadarRow[] =
      competitiveRadarRows.map((row, index) => ({
        category: getCell(row, ["categoria", "categoria movimento"]),
        competitor: getCell(row, ["concorrente", "competitor"]),
        date: getCell(row, ["data", "data movimento"]),
        id:
          getCell(row, ["id radar", "id competitivo", "id movimento"]) ||
          `competitive-radar-${index + 1}`,
        impact: getCell(row, ["impacto", "impacto estimado"]),
        movement: getCell(row, ["movimento", "movimento competitivo"]),
        source: getCell(row, ["fonte", "source"]),
      }));

    const benchmarks: GrowthBenchmarkRow[] = benchmarkRows.map(
      (row, index) => ({
        category: getCell(row, ["categoria"]),
        comparativeStatus: getCell(row, ["status comparativo"]),
        difference: getCell(row, ["diferenca"]),
        id: getCell(row, ["id benchmark"]) || `benchmark-${index + 1}`,
        impact: getCell(row, ["impacto"]),
        kvValue: getCell(row, ["valor kv partners"]),
        marketValue: getCell(row, ["valor mercado"]),
        metric: getCell(row, ["metrica"]),
        observation: getCell(row, ["observacao"]),
        priority: getCell(row, ["prioridade"]),
      }),
    );

    return {
      benchmarks,
      competitiveRadar,
      insights,
      jtbd,
      marketTrends,
      radar: buildRadar(
        jtbd,
        insights,
        recommendations,
        marketTrends,
        competitiveRadar,
        benchmarks,
      ),
      recommendations,
      source: "google-sheets",
    };
  } catch (error) {
    console.error("Failed to read KV Partners growth sheets", error);
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
}
