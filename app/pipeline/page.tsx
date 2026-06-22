'use client'

// app/pipeline/page.tsx
// Pagina de monitoramento do pipeline KV Partners.
// Mostra historico de snapshots e permite rodar o pipeline manualmente.

import { useEffect, useState, useCallback } from 'react'

interface Snapshot {
  snapshotId: string
  dataCalculo: string
  rowCount: number
  critical: number
  high: number
  medium: number
  low: number
}

type RunStatus = 'idle' | 'running' | 'success' | 'error'

export default function PipelinePage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading]     = useState(true)
  const [runStatus, setRunStatus] = useState<RunStatus>('idle')
  const [lastResult, setLastResult] = useState<string>('')

  const fetchHistory = useCallback(async () => {
    try {
      const res  = await fetch('/api/pipeline/history')
      const data = await res.json() as { snapshots: Snapshot[] }
      setSnapshots(data.snapshots ?? [])
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchHistory() }, [fetchHistory])

  const runPipeline = async () => {
    setRunStatus('running')
    setLastResult('')
    try {
      const res  = await fetch('/api/pipeline/snapshot', {
        method:  'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-pipeline-secret': 'kv-pipeline-2026',
        },
      })
      const data = await res.json() as { ok: boolean; rowsWritten?: number; snapshotId?: string; error?: string }
      if (data.ok) {
        setRunStatus('success')
        setLastResult(`${data.rowsWritten ?? 0} contas salvas — snapshot ${data.snapshotId}`)
        await fetchHistory()
      } else {
        setRunStatus('error')
        setLastResult(data.error ?? 'Erro desconhecido')
      }
    } catch (err) {
      setRunStatus('error')
      setLastResult(String(err))
    }
  }

  const statusColor = {
    idle:    'bg-zinc-700 hover:bg-zinc-600',
    running: 'bg-zinc-700 opacity-60 cursor-not-allowed',
    success: 'bg-green-700 hover:bg-green-600',
    error:   'bg-red-700 hover:bg-red-600',
  }[runStatus]

  const statusLabel = {
    idle:    'Rodar Pipeline Agora',
    running: 'Rodando...',
    success: 'Sucesso! Rodar novamente',
    error:   'Erro. Tentar novamente',
  }[runStatus]

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Pipeline IOI</h1>
          <p className="text-zinc-400 text-sm">
            Monitora e aciona o pipeline de snapshot de scores em tempo real.
          </p>
        </div>

        {/* Run Button */}
        <div className="bg-zinc-900 rounded-xl p-6 space-y-4 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Executar snapshot manual</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Lê os scores atuais do IOI e salva um snapshot no histórico.
              </p>
            </div>
            <button
              onClick={() => { void runPipeline() }}
              disabled={runStatus === 'running'}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${statusColor}`}
            >
              {statusLabel}
            </button>
          </div>

          {lastResult && (
            <div className={`text-sm px-4 py-2 rounded-lg ${
              runStatus === 'success' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'
            }`}>
              {lastResult}
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="font-semibold">Histórico de execuções</h2>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-zinc-500 text-sm text-center">Carregando...</div>
          ) : snapshots.length === 0 ? (
            <div className="px-6 py-8 text-zinc-500 text-sm text-center">Nenhum snapshot encontrado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase border-b border-zinc-800">
                  <th className="px-6 py-3 text-left">Snapshot ID</th>
                  <th className="px-6 py-3 text-left">Data</th>
                  <th className="px-6 py-3 text-center">Contas</th>
                  <th className="px-6 py-3 text-center">Crítico</th>
                  <th className="px-6 py-3 text-center">Alto</th>
                  <th className="px-6 py-3 text-center">Médio</th>
                  <th className="px-6 py-3 text-center">Baixo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {snapshots.map((s) => (
                  <tr key={s.snapshotId} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-300">{s.snapshotId}</td>
                    <td className="px-6 py-4 text-zinc-400">{s.dataCalculo}</td>
                    <td className="px-6 py-4 text-center font-semibold">{s.rowCount}</td>
                    <td className="px-6 py-4 text-center">
                      {s.critical > 0 ? (
                        <span className="bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full text-xs">{s.critical}</span>
                      ) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.high > 0 ? (
                        <span className="bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded-full text-xs">{s.high}</span>
                      ) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.medium > 0 ? (
                        <span className="bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded-full text-xs">{s.medium}</span>
                      ) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.low > 0 ? (
                        <span className="bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full text-xs">{s.low}</span>
                      ) : <span className="text-zinc-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-zinc-600 text-xs text-center">
          O pipeline também roda automaticamente todo dia entre 0h e 1h via Google Apps Script.
        </p>
      </div>
    </div>
  )
}
