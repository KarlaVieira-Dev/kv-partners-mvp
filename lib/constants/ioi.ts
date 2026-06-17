// lib/constants/ioi.ts
// ============================================================
// FONTE ÚNICA DE VERDADE para pesos, sinais e thresholds IOI.
// Qualquer alteração de regra de negócio começa aqui.
// Referência canônica: IOI_08_Sinais + IOI_09_Score
// ============================================================

export const IOI_SIGNAL_WEIGHTS = {
  'SIG-001': 25, // Onboarding Incompleto
  'SIG-002': 15, // Onboarding Atrasado
  'SIG-003': 20, // Acessos Negados
  'SIG-004': 10, // Baixa Utilização
  'SIG-005': 10, // Usuários Inativos
  'SIG-006': 15, // Feedback Negativo
  'SIG-007': 15, // NPS Baixo
  'SIG-008': 20, // Reclamação Crítica
  'SIG-009': 10, // Sem Atividade Recente
  'SIG-010': 15, // Escalação de Suporte
} as const

export type SignalId = keyof typeof IOI_SIGNAL_WEIGHTS

export const IOI_RISK_THRESHOLDS = {
  BAIXO:   { min: 0,  max: 30 },
  MEDIO:   { min: 31, max: 60 },
  ALTO:    { min: 61, max: 80 },
  CRITICO: { min: 81, max: 100 },
} as const

export type RiskLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico'

export const IOI_VECTOR_WEIGHTS = {
  onboarding: 25,
  acessos:    20,
  feedback:   15,
  utilizacao: 10,
} as const

export const ONBOARDING_RISK_DAYS_THRESHOLD     = 14
export const ONBOARDING_RISK_PROGRESS_THRESHOLD = 50

export function classifyRiskLevel(score: number): RiskLevel {
  if (score <= IOI_RISK_THRESHOLDS.BAIXO.max)   return 'Baixo'
  if (score <= IOI_RISK_THRESHOLDS.MEDIO.max)   return 'Médio'
  if (score <= IOI_RISK_THRESHOLDS.ALTO.max)    return 'Alto'
  return 'Crítico'
}

export function isHighPriority(level: RiskLevel): boolean {
  return level === 'Alto' || level === 'Crítico'
}
