// app/api/pipeline/history/route.ts
// Retorna o historico de snapshots do pipeline agrupado por execucao.
// Usa posicao de coluna (nao nome) para ser robusto mesmo sem header row.

import { NextResponse } from 'next/server'

const spreadsheetId = () =>
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  '1mM_S-RA7TBK6MC04evhv_U9Y31J0izmsgIhPpn8hBUg'

// Parseia uma linha de CSV respeitando campos entre aspas
function parseLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

export async function GET() {
  try {
    const params = new URLSearchParams({ sheet: '07b_IOI_Score_History', tqx: 'out:csv' })
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId()}/gviz/tq?${params}`

    const response = await fetch(url, { next: { revalidate: 60 } })
    if (!response.ok) {
      console.error('[pipeline/history] Sheet fetch failed:', response.status)
      return NextResponse.json({ snapshots: [], error: `Sheet HTTP ${response.status}` })
    }

    const text = await response.text()
    const lines = text.split('\n').filter(l => l.trim() !== '')

    if (lines.length === 0) {
      return NextResponse.json({ snapshots: [], total: 0 })
    }

    // Detecta se a primeira linha e header (contem "snapshot") ou dado (comeca com numero)
    const firstCols = parseLine(lines[0])
    const hasHeader = firstCols[0].toLowerCase().includes('snapshot') && !/^\d/.test(firstCols[0])
    const dataLines = hasHeader ? lines.slice(1) : lines

    console.log('[pipeline/history] First col:', firstCols[0], '| hasHeader:', hasHeader, '| rows:', dataLines.length)

    // Posicoes fixas das colunas (ordem definida em appendRows e snapshotIOIScores):
    // 0: snapshot_id | 1: id conta | 2: risk score | 3: nivel risco |
    // 4: health | 5: onboarding | 6: access | 7: feedback | 8: usage |
    // 9: motivo | 10: acao | 11: sinais | 12: data calculo

    const grouped = new Map<string, {
      snapshotId: string
      dataCalculo: string
      rowCount: number
      critical: number
      high: number
      medium: number
      low: number
    }>()

    for (const line of dataLines) {
      const cols = parseLine(line)
      if (cols.length < 4) continue

      const id    = (cols[0] ?? '').trim()
      const nivel = (cols[3] ?? '').toLowerCase().trim()
      const data  = (cols[12] ?? '').trim()

      if (!id) continue

      if (!grouped.has(id)) {
        grouped.set(id, { snapshotId: id, dataCalculo: data, rowCount: 0, critical: 0, high: 0, medium: 0, low: 0 })
      }

      const entry = grouped.get(id)!
      entry.rowCount++
      if (nivel.includes('crít') || nivel === 'crítico' || nivel === 'critico') entry.critical++
      else if (nivel === 'alto') entry.high++
      else if (nivel.includes('médio') || nivel === 'medio') entry.medium++
      else if (nivel === 'baixo') entry.low++
    }

    const snapshots = Array.from(grouped.values()).reverse()

    return NextResponse.json({ snapshots, total: dataLines.length })
  } catch (error) {
    console.error('[pipeline/history]', error)
    return NextResponse.json({ snapshots: [], error: String(error) })
  }
}
