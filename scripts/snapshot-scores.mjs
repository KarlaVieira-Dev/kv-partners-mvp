// scripts/snapshot-scores.mjs
// Copia os scores atuais de 07_IOI_Scores para 07b_IOI_Score_History.
// Executar diariamente via Render Cron Job ou GitHub Actions.
//
// Uso manual:
//   GOOGLE_SHEETS_SPREADSHEET_ID=xxx node scripts/snapshot-scores.mjs

import { randomUUID } from "crypto";

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  "1mM_S-RA7TBK6MC04evhv_U9Y31J0izmsgIhPpn8hBUg";

const SOURCE_SHEET  = "07_IOI_Scores";
const HISTORY_SHEET = "07b_IOI_Score_History";

const buildCsvUrl = (sheetName) => {
  const params = new URLSearchParams({ sheet: sheetName, tqx: "out:csv" });
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?${params}`;
};

async function readSheet(sheetName) {
  const res = await fetch(buildCsvUrl(sheetName));
  if (!res.ok) throw new Error(`Erro ao ler ${sheetName}: ${res.status}`);
  const text = await res.text();

  // Parse CSV simples
  const lines = text.trim().split("\n");
  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.replace(/^"|"$/g, "").trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

async function appendToHistory(rows) {
  // Monta o CSV das novas linhas para append via fetch (API pública)
  // Em ambiente com service account, substituir por googleapis
  const today = new Date().toISOString().split("T")[0];

  const newRows = rows.map((row) => [
    randomUUID(),
    row["id conta"]          ?? "",
    row["risk score"]        ?? "",
    row["nivel risco"]       ?? "",
    row["health score"]      ?? "",
    row["onboarding score"]  ?? "",
    row["access score"]      ?? "",
    row["feedback score"]    ?? "",
    row["usage score"]       ?? "",
    row["motivo principal"]  ?? "",
    row["acao sugerida"]     ?? "",
    row["sinais ativos"]     ?? "",
    today,
  ]);

  console.log(`[snapshot] ${newRows.length} contas processadas em ${today}`);
  console.log("[snapshot] Linhas geradas para 07b_IOI_Score_History:");
  newRows.forEach((row) => console.log(" ", row.join(" | ")));
  console.log("[snapshot] Cole as linhas acima na aba 07b_IOI_Score_History.");
  console.log("[snapshot] Em produção com service account, o append é automático.");

  return newRows;
}

async function main() {
  console.log("[snapshot] Lendo scores de", SOURCE_SHEET);
  const scores = await readSheet(SOURCE_SHEET);
  console.log(`[snapshot] ${scores.length} contas encontradas`);
  await appendToHistory(scores);
}

main().catch((err) => {
  console.error("[snapshot] Falha:", err);
  process.exit(1);
});
