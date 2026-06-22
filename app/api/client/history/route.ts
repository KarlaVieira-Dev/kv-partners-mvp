// app/api/client/history/route.ts
// Retorna o historico de scores de um cliente especifico pelo email.
// Usado pelo portal do cliente (kv-partner-hub.lovable.app).
//
// GET /api/client/history?email=ana.martins@grupoorion.com.br
//
// Fluxo:
// 1. Busca email_usuario na aba 03_Usuarios → obtem id_conta
// 2. Filtra 07b_IOI_Score_History por id_conta
// 3. Retorna historico formatado + deteccao de mudancas de nivel

import { NextResponse } from 'next/server'

const spreadsheetId = () =>
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  '1mM_S-RA7TBK6MC04evhv_U9Y31J0izmsgIhPpn8hBUg'

// Permite chamadas do portal Lovable (CORS)
const ALLOWED_ORIGINS = [
  'https://kv-partner-hub.lovable.app',
  'http://localhost:3000', // para testes locais
]

function corsHeaders(origin: string | null) {
  const allowed = ALLOWED_ORIGINS.includes(origin ?? '') ? (origin ?? '') : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

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

async function fetchSheetRows(sheetName: string): Promise<string[][]> {
  const params = new URLSearchParams({ sheet: sheetName, tqx: 'out:csv' })
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId()}/gviz/tq?${params}`
  const res = await fetch(url, { next: { revalidate: 120 } })
  if (!res.ok) throw new Error(`Sheet "${sheetName}" HTTP ${res.status}`)
  const text = await res.text()
  return text.split('\n').filter(l => l.trim() !== '').map(parseLine)
}

// Preflight CORS
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

export async function GET(request: Request) {
  const origin = request.headers.get('origin')
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.toLowerCase().trim()

  if (!email) {
    return NextResponse.json(
      { error: 'Parametro "email" obrigatorio.' },
      { status: 400, headers: corsHeaders(origin) }
    )
  }

  try {
    const usuarioRows = await fetchSheetRows('03_Usuarios')
    const firstRow    = usuarioRows[0] ?? []
    const hasHeader   = firstRow[0]?.toLowerCase().includes('id') && !firstRow[0].match(/^USR/)
    const userDataRows = hasHeader ? usuarioRows.slice(1) : usuarioRows

    const userRow = userDataRows.find(
      r => (r[3] ?? '').toLowerCase().trim() === email
    )

    if (!userRow) {
      return NextResponse.json(
        { error: 'Usuario nao encontrado para este email.' },
        { status: 404, headers: corsHeaders(origin) }
      )
    }

    const accountId = (userRow[1] ?? '').trim()
    const userName  = (userRow[2] ?? '').trim()

    const histRows   = await fetchSheetRows('07b_IOI_Score_History')
    const firstHist  = histRows[0] ?? []
    const hasHistHdr = firstHist[0]?.toLowerCase().includes('snapshot')
    const histData   = hasHistHdr ? histRows.slice(1) : histRows

    const clientHistory = histData
      .filter(r => (r[1] ?? '').trim() === accountId)
      .map(r => ({
        snapshotId:      (r[0]  ?? '').trim(),
        dataCalculo:     (r[12] ?? '').trim(),
        riskScore:       Number(r[2])  || 0,
        riskLevel:       (r[3]  ?? '').trim(),
        healthScore:     Number(r[4])  || 0,
        onboardingScore: Number(r[5])  || 0,
        accessScore:     Number(r[6])  || 0,
        feedbackScore:   Number(r[7])  || 0,
        usageScore:      Number(r[8])  || 0,
        motivo:          (r[9]  ?? '').trim(),
        acao:            (r[10] ?? '').trim(),
      }))
      .sort((a, b) => a.snapshotId.localeCompare(b.snapshotId))

    const levelChanges: { from: string; to: string; dataCalculo: string }[] = []
    for (let i = 1; i < clientHistory.length; i++) {
      const prev = clientHistory[i - 1]
      const curr = clientHistory[i]
      if (prev.riskLevel && curr.riskLevel && prev.riskLevel !== curr.riskLevel) {
        levelChanges.push({
          from:        prev.riskLevel,
          to:          curr.riskLevel,
          dataCalculo: curr.dataCalculo,
        })
      }
    }

    return NextResponse.json(
      { accountId, userName, totalSnapshots: clientHistory.length, history: clientHistory, levelChanges },
      { headers: corsHeaders(origin) }
    )

  } catch (error) {
    console.error('[client/history]', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500, headers: corsHeaders(origin) }
    )
  }
}
