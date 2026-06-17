// lib/contracts/ao.contract.ts
// Define o que o módulo AO produz e publica para os módulos downstream.
// Nenhum outro módulo acessa tabelas AO diretamente — consome este contrato.

export interface AOAccountOutput {
  id: string
  nome: string
  tipo: 'Gestora' | 'Gerenciada'
  segmento: string
  status: 'Ativo' | 'Em Onboarding' | 'Inativo' | 'Suspenso'
  healthScore: number
  relacionamentos: string[]
}

export interface AOOnboardingOutput {
  id: string
  contaId: string
  status: 'Em Andamento' | 'Concluído' | 'Atrasado' | 'Bloqueado'
  progresso: number
  etapaAtual: string
  diasEmAndamento: number
  proximaAcao: string
  dataInicio: Date
  dataConclusao?: Date
}

export interface AOEventOutput {
  id: string
  contaId: string
  tipo: string
  descricao: string
  timestamp: Date
}
