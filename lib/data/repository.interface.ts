// lib/data/repository.interface.ts
// Contrato que qualquer fonte de dados deve implementar.
// Google Sheets hoje — PostgreSQL, Supabase ou outro amanhã.
// Trocar a fonte de dados = trocar apenas a implementação, não o domínio.

import type {
  AOAccountOutput,
  AOOnboardingOutput,
  IOIRiskOutput,
  MGIInsightOutput,
  MGIRecommendationOutput,
} from "@/lib/contracts";

export interface KVRepository {
  // ── AO ──────────────────────────────────────────────────────
  getAccounts(): Promise<AOAccountOutput[]>
  getAccount(id: string): Promise<AOAccountOutput | null>
  getOnboardings(contaId?: string): Promise<AOOnboardingOutput[]>

  // ── IOI ─────────────────────────────────────────────────────
  getRiskScores(): Promise<IOIRiskOutput[]>
  getRiskScore(contaId: string): Promise<IOIRiskOutput | null>

  // ── MGI ─────────────────────────────────────────────────────
  getInsights(contaId?: string): Promise<MGIInsightOutput[]>
  getRecommendations(contaId?: string): Promise<MGIRecommendationOutput[]>
}

// ── Injeção de dependência ───────────────────────────────────
// Permite trocar o repositório por ambiente (produção, teste, mock)

let _repository: KVRepository | null = null;

export function getRepository(): KVRepository {
  if (!_repository) {
    throw new Error(
      "Repository não inicializado. Chame initRepository() antes de usar."
    );
  }
  return _repository;
}

export function initRepository(repo: KVRepository): void {
  _repository = repo;
}
