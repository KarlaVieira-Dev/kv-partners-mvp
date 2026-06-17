// lib/contracts/index.ts
// Ponto central de exportação dos contratos de módulo.
// Importe sempre daqui, nunca diretamente dos arquivos individuais.
//
// Uso:
//   import type { IOIRiskOutput } from '@/lib/contracts'

export type {
  AOAccountOutput,
  AOOnboardingOutput,
  AOEventOutput,
} from './ao.contract'

export type {
  IOIRiskOutput,
  IOIScoreSnapshot,
} from './ioi.contract'

export type {
  MGIOpportunityOutput,
  MGIInsightOutput,
  MGIRecommendationOutput,
} from './mgi.contract'
