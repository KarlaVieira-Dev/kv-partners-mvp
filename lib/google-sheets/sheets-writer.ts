// lib/google-sheets/sheets-writer.ts
// Escreve dados na planilha via Google Apps Script Web App.
// Nao requer service account — autentica como a conta do proprietario do script.

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_WRITER_URL ?? ''
const SECRET_TOKEN    = process.env.APPS_SCRIPT_SECRET   ?? 'kv-partners-2026'

interface AppendRowsPayload {
  action: 'appendRows'
  sheet: string
  rows: unknown[][]
  token: string
}

interface UpdateCellPayload {
  action: 'updateCell'
  sheet: string
  row: number
  col: number
  value: unknown
  token: string
}

type Payload = AppendRowsPayload | UpdateCellPayload

async function callWriter(payload: Payload): Promise<void> {
  if (!APPS_SCRIPT_URL) {
    console.warn('[sheets-writer] APPS_SCRIPT_WRITER_URL nao configurada — escrita ignorada.')
    return
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`[sheets-writer] HTTP ${response.status}: ${await response.text()}`)
  }

  const result = await response.json() as { ok: boolean; error?: string }
  if (!result.ok) {
    throw new Error(`[sheets-writer] Erro do script: ${result.error}`)
  }
}

/** Adiciona linhas ao final de uma aba */
export async function appendRows(sheet: string, rows: unknown[][]): Promise<void> {
  await callWriter({ action: 'appendRows', sheet, rows, token: SECRET_TOKEN })
}

/** Atualiza uma celula especifica (row e col sao 1-based) */
export async function updateCell(
  sheet: string,
  row: number,
  col: number,
  value: unknown
): Promise<void> {
  await callWriter({ action: 'updateCell', sheet, row, col, value, token: SECRET_TOKEN })
}
