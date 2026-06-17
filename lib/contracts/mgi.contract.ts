// lib/contracts/mgi.contract.ts
// Define o que o MGI produz para o Executive Center.
// MGI nunca calcula risco — apenas consome IOIRiskOutput e gera estratégia.

import type { RiskLevel } from '@/lib/constants/ioi'

export interface MGIOpportunityOutput {
  contaId: string
  opportunityScore: number   // healthScore - (riskScore × 0.5)
  expansionPotential: 'Alto' | 'Médio' | 'Baixo'
  churnRisk: RiskLevel
  insights: MGIInsightOutput[]
  recommendations: MGIRecommendationOutput[]
}

export interface MGIInsightOutput {
  id: string
  contaId: string
  tipo: 'Risco' | 'Crescimento' | 'Retenção' | 'Expansão' | 'Eficiência'
  titulo: string
  descricao: string
  impacto: 'Alto' | 'Médio' | 'Baixo'
  urgencia: 'Imediato' | '30 dias' | '90 dias'
  evidencias: string[]
}

export interface MGIRecommendationOutput {
  id: string
  contaId: string
  acao: string
  motivo: string
  impactoEsperado: string
  esforco: 'Alto' | 'Médio' | 'Baixo'
  prioridade: number
}
