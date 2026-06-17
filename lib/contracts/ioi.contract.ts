// lib/contracts/ioi.contract.ts
// Define o que o IOI produz e publica — ÚNICA fonte de risco do ecossistema.
// MGI e Executive Center consomem apenas esta interface.
// Nunca acessam 04_Onboardings, 05_Eventos ou 06_Feedbacks diretamente.

import type { RiskLevel, SignalId } from '@/lib/constants/ioi'

export interface IOIRiskOutput {
  contaId: string
  riskScore: number
  riskLevel: RiskLevel
  healthScore: number
  principalMotivo: string
  acaoRecomendada: string
  activeSignals: SignalId[]
  onboardingScore: number
  acessosScore: number
  feedbackScore: number
  utilizacaoScore: number
  dataCalculo: Date
}

export interface IOIScoreSnapshot extends IOIRiskOutput {
  snapshotId: string
}
