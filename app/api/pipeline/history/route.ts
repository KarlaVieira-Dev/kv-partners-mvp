// app/api/pipeline/history/route.ts
// Retorna o historico de snapshots do pipeline agrupado por execucao.

import { NextResponse } from 'next/server'
import { parseCsvWithMetadata } from '@/lib/google-sheets/csv'

const spreadsheetId = () =>
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  '1mM_S-RA7TBK6MC04evhv_U9Y31J0izmsgIhPpn8hBUg'

export async function GET() {
  try {
    const params = new URLSearchParams({ sheet: '07b_IOI_Score_History', tqx: 'out:csv' })
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId()}/gviz/tq?${params}`

    const response = await fetch(url, { next: { revalidate: 60 } })
    if (!response.ok) {
      return NextResponse.json({ snapshots: [], error: 'Sheet unavailable' })
    }

    const { records } = parseCsvWithMetadata(await response.text())

    // Agrupa linhas por snapshotId
    const grouped = new Map<string, {
      snapshotId: string
      dataCalculo: string
      rowCount: number
      critical: number
      high: number
      medium: number
      low: number
    }>()

    for (const row of records) {
      const id    = String(row['snapshot_id'] ?? row['snapshotid'] ?? '').trim()
      const nivel = String(row['nivel risco'] ?? '').toLowerCase()
      const data  = String(row['data calculo'] ?? '').trim()
      if (!id) continue

      if (!grouped.has(id)) {
        grouped.set(id, { snapshotId: id, dataCalculo: data, rowCount: 0, critical: 0, high: 0, medium: 0, low: 0 })
      }
      const entry = grouped.get(id)!
      entry.rowCount++
      if (nivel.includes('crít') || nivel.includes('critico')) entry.critical++
      else if (nivel.includes('alto'))   entry.high++
      else if (nivel.includes('médio') || nivel.includes('medio')) entry.medium++
      else entry.low++
    }

    // Ordena do mais recente para o mais antigo
    const snapshots = Array.from(grouped.values()).reverse()

    return NextResponse.json({ snapshots, total: records.length })
  } catch (error) {
    console.error('[pipeline/history]', error)
    return NextResponse.json({ snapshots: [], error: String(error) })
  }
}
