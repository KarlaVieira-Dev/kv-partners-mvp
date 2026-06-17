// lib/google-sheets/ioi-history.ts
// Lê o histórico de scores IOI da aba 07b_IOI_Score_History.
// Permite ao Executive Center responder "o risco desta conta piorou?"

import { parseCsvWithMetadata } from "@/lib/google-sheets/csv";
import type { RiskLevel } from "@/lib/constants/ioi";

type SheetRow = Record<string, string>;

export interface IOIScoreSnapshot {
  snapshotId: string
  contaId: string
  riskScore: number
  riskLevel: RiskLevel
  healthScore: number
  onboardingScore: number
  acessosScore: number
  feedbackScore: number
  utilizacaoScore: number
  principalMotivo: string
  acaoRecomendada: string
  activeSignals: string[]
  dataCalculo: Date
}

export interface RiskTrend {
  delta: number
  direction: 'up' | 'down' | 'stable'
  latest: number
  previous: number
}

const spreadsheetId = () =>
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  "1mM_S-RA7TBK6MC04evhv_U9Y31J0izmsgIhPpn8hBUg";

const HISTORY_SHEET = "07b_IOI_Score_History";
const REVALIDATE_SECONDS = 300;

const toNumber = (value: string) => {
  const parsed = Number((value ?? "").replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildSheetCsvUrl = (sheetName: string) => {
  const params = new URLSearchParams({
    sheet: sheetName,
    tqx: "out:csv",
  });
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId()}/gviz/tq?${params.toString()}`;
};

const readSheet = async (sheetName: string): Promise<SheetRow[]> => {
  const response = await fetch(buildSheetCsvUrl(sheetName), {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`${sheetName} responded with ${response.status}`);
  }
  return parseCsvWithMetadata(await response.text()).records;
};

/** Retorna snapshots do histórico, opcionalmente filtrados por conta e janela de dias */
export async function getScoreHistory(
  contaId?: string,
  limitDays = 30
): Promise<IOIScoreSnapshot[]> {
  try {
    const rows = await readSheet(HISTORY_SHEET);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - limitDays);

    return rows
      .map((row): IOIScoreSnapshot => ({
        snapshotId:      row["snapshot_id"]       ?? "",
        contaId:         row["id conta"]           ?? "",
        riskScore:       toNumber(row["risk score"]       ?? ""),
        riskLevel:       (row["nivel risco"]       ?? "Baixo") as RiskLevel,
        healthScore:     toNumber(row["health score"]     ?? ""),
        onboardingScore: toNumber(row["onboarding score"] ?? ""),
        acessosScore:    toNumber(row["access score"]     ?? ""),
        feedbackScore:   toNumber(row["feedback score"]   ?? ""),
        utilizacaoScore: toNumber(row["usage score"]      ?? ""),
        principalMotivo: row["motivo principal"]   ?? "",
        acaoRecomendada: row["acao sugerida"]      ?? "",
        activeSignals:   (row["sinais ativos"] ?? "").split(",").filter(Boolean),
        dataCalculo:     new Date(row["data calculo"] ?? ""),
      }))
      .filter((s) => {
        const matchesConta = !contaId || s.contaId === contaId;
        const withinWindow = s.dataCalculo >= cutoff;
        return matchesConta && withinWindow && !isNaN(s.dataCalculo.getTime());
      })
      .sort((a, b) => b.dataCalculo.getTime() - a.dataCalculo.getTime());
  } catch (error) {
    console.error("Failed to read IOI score history", error);
    return [];
  }
}

/** Calcula variação de risco vs. N dias atrás para uma conta específica */
export async function getRiskTrend(
  contaId: string,
  compareDays = 7
): Promise<RiskTrend> {
  const history = await getScoreHistory(contaId, compareDays + 1);

  if (history.length < 2) {
    return { delta: 0, direction: "stable", latest: 0, previous: 0 };
  }

  const latest   = history[0].riskScore;
  const previous = history[history.length - 1].riskScore;
  const delta    = latest - previous;

  return {
    delta:     Math.abs(delta),
    direction: delta > 2 ? "up" : delta < -2 ? "down" : "stable",
    latest,
    previous,
  };
}
