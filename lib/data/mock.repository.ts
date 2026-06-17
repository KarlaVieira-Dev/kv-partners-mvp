// lib/data/mock.repository.ts
// Implementação em memória do KVRepository — usada para testes.
// Permite testar qualquer módulo sem depender do Google Sheets.
//
// Uso:
//   import { MockRepository } from "@/lib/data/mock.repository"
//   initRepository(new MockRepository())

import type { KVRepository } from "./repository.interface";
import type {
  AOAccountOutput,
  AOOnboardingOutput,
  IOIRiskOutput,
  MGIInsightOutput,
  MGIRecommendationOutput,
} from "@/lib/contracts";

export class MockRepository implements KVRepository {
  private accounts: AOAccountOutput[] = [
    {
      id: "conta-001",
      nome: "Grupo Orion",
      tipo: "Gestora",
      segmento: "Educação",
      status: "Ativo",
      healthScore: 87,
      relacionamentos: ["conta-002", "conta-003"],
    },
    {
      id: "conta-002",
      nome: "Clínica Alfa",
      tipo: "Gerenciada",
      segmento: "Saúde",
      status: "Ativo",
      healthScore: 74,
      relacionamentos: ["conta-001"],
    },
    {
      id: "conta-003",
      nome: "Unidade Saber Mais",
      tipo: "Gerenciada",
      segmento: "Educação",
      status: "Em Onboarding",
      healthScore: 58,
      relacionamentos: ["conta-001"],
    },
  ];

  private riskScores: IOIRiskOutput[] = [
    {
      contaId: "conta-002",
      riskScore: 12,
      riskLevel: "Baixo",
      healthScore: 74,
      principalMotivo: "Operação estável",
      acaoRecomendada: "Monitoramento padrão",
      activeSignals: [],
      onboardingScore: 0,
      acessosScore: 5,
      feedbackScore: 7,
      utilizacaoScore: 0,
      dataCalculo: new Date(),
    },
    {
      contaId: "conta-003",
      riskScore: 68,
      riskLevel: "Alto",
      healthScore: 58,
      principalMotivo: "Onboarding incompleto há 18 dias",
      acaoRecomendada: "Acionar CSM para desbloqueio",
      activeSignals: ["SIG-001", "SIG-002"],
      onboardingScore: 40,
      acessosScore: 15,
      feedbackScore: 13,
      utilizacaoScore: 0,
      dataCalculo: new Date(),
    },
  ];

  async getAccounts(): Promise<AOAccountOutput[]> {
    return this.accounts;
  }

  async getAccount(id: string): Promise<AOAccountOutput | null> {
    return this.accounts.find((a) => a.id === id) ?? null;
  }

  async getOnboardings(_contaId?: string): Promise<AOOnboardingOutput[]> {
    return [];
  }

  async getRiskScores(): Promise<IOIRiskOutput[]> {
    return this.riskScores;
  }

  async getRiskScore(contaId: string): Promise<IOIRiskOutput | null> {
    return this.riskScores.find((r) => r.contaId === contaId) ?? null;
  }

  async getInsights(_contaId?: string): Promise<MGIInsightOutput[]> {
    return [];
  }

  async getRecommendations(_contaId?: string): Promise<MGIRecommendationOutput[]> {
    return [];
  }
}
