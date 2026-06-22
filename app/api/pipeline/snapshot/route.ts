// app/api/pipeline/snapshot/route.ts
// Rota que le os scores atuais do IOI e salva um snapshot no historico.
// Pode ser chamada manualmente ou por um cron externo.

import { NextResponse } from 'next/server'
import { appendRows } from '@/lib/google-sheets/sheets-writer'
import { getRisksFromSheets } from '@/lib/google-sheets/risks'

const PIPELINE_SECRET = process.env.PIPELINE_SECRET ?? 'kv-pipeline-2026'

export async function POST(request: Request) {
  try {
    // Verifica o token de autorizacao
    const auth = request.headers.get('x-pipeline-secret')
    if (auth !== PIPELINE_SECRET) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Le os scores atuais do IOI
    const { risks } = await getRisksFromSheets()

    if (!risks || risks.length === 0) {
      return NextResponse.json({ ok: false, error: 'No risk data found' }, { status: 404 })
    }

    // Monta as linhas do snapshot
    const now = new Date()
    const snapshotId = now
      .toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' })
      .replace(/[^0-9]/g, '')
      .slice(0, 12)
    const dataCalculo = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

    const rows = risks.map((risk) => [
      snapshotId,
      risk.accountId,
      risk.riskScore,
      risk.riskLevel,
      risk.healthScore,
      risk.onboardingScore,
      risk.accessScore,
      risk.feedbackScore,
      risk.usageScore,
      risk.mainReason,
      risk.suggestedAction,
      '', // sinais ativos — disponivel em versao futura
      dataCalculo,
    ])

    await appendRows('07b_IOI_Score_History', rows)

    return NextResponse.json({
      ok: true,
      snapshotId,
      rowsWritten: rows.length,
    })

  } catch (error) {
    console.error('[pipeline/snapshot] Error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
