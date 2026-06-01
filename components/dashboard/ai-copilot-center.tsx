"use client";

import { Bot, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  ExecutiveAccountRow,
  ExecutiveAccountsResponse,
  FeedbackRow,
  FeedbacksResponse,
  GrowthBenchmarkRow,
  GrowthMarketTrendRow,
  GrowthRecommendationRow,
  GrowthResponse,
  OnboardingRow,
  OnboardingsResponse,
  RiskRow,
  RisksResponse,
} from "@/lib/google-sheets/types";
import {
  FilterBar,
  IntelligentSummary,
  KPIGrid,
  Pagination,
  usePaginatedRows,
} from "./shared";

type CopilotData = {
  accounts: ExecutiveAccountRow[];
  feedbacks: FeedbackRow[];
  growth: GrowthResponse;
  onboardings: OnboardingRow[];
  risks: RiskRow[];
};

type CopilotAnswer = {
  accounts: string[];
  data: string[];
  recommendations: string[];
  summary: string;
};

type ExecutiveBriefing = {
  accountsAtRisk: number;
  averageHealth: number;
  averageRisk: number;
  belowBenchmark: number;
  mainRecommendation: string;
  opportunities: number;
  relevantTrends: number;
};

const quickQuestions = [
  "Onde estamos abaixo do mercado?",
  "Quais contas precisam de atenção?",
  "Quais contas possuem maior potencial de expansão?",
  "Quem deveria receber uma oferta de upgrade?",
  "O que os concorrentes estão fazendo?",
  "Quais tendências merecem investimento?",
  "Onde devemos investir nos próximos 90 dias?",
  "Qual funcionalidade possui maior oportunidade?",
  "Qual iniciativa gera maior impacto?",
  "Qual iniciativa devo priorizar nos próximos 90 dias?",
];

const emptyGrowth: GrowthResponse = {
  benchmarks: [],
  competitiveRadar: [],
  insights: [],
  jtbd: [],
  marketTrends: [],
  radar: { expansion: 0, operationalEfficiency: 0, retention: 0 },
  recommendations: [],
  source: "not-configured",
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const average = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  );
};

const topBy = <T,>(items: T[], score: (item: T) => number, limit = 5) =>
  [...items]
    .sort((first, second) => score(second) - score(first))
    .slice(0, limit);

const isHighPriority = (value: string) => {
  const normalized = normalize(value);
  return (
    normalized.includes("alta") ||
    normalized.includes("crit") ||
    normalized.includes("alto")
  );
};

const isBelowMarket = (benchmark: GrowthBenchmarkRow) =>
  normalize(benchmark.comparativeStatus).includes("abaixo") ||
  benchmark.difference.trim().startsWith("-");

const recommendationScore = (recommendation: GrowthRecommendationRow) =>
  recommendation.opportunityScore +
  (isHighPriority(recommendation.priority) ? 20 : 0);

const accountOpportunityScore = (risk: RiskRow) =>
  Math.round(risk.healthScore - risk.riskScore * 0.5);

const trendScore = (trend: GrowthMarketTrendRow) =>
  (isHighPriority(trend.priority) ? 2 : 0) +
  (isHighPriority(trend.impact) ? 2 : 0);

function buildExecutiveBriefing(data: CopilotData): ExecutiveBriefing {
  const belowBenchmark = data.growth.benchmarks.filter(isBelowMarket);
  const priorityRecommendation = topBy(
    data.growth.recommendations,
    recommendationScore,
    1,
  )[0];
  const priorityBenchmark = belowBenchmark[0];

  return {
    accountsAtRisk: data.risks.filter(
      (risk) =>
        risk.riskScore >= 70 ||
        normalize(risk.riskLevel).includes("alto") ||
        normalize(risk.riskLevel).includes("crit"),
    ).length,
    averageHealth: average(data.risks.map((risk) => risk.healthScore)),
    averageRisk: average(data.risks.map((risk) => risk.riskScore)),
    belowBenchmark: belowBenchmark.length,
    mainRecommendation:
      priorityRecommendation?.recommendation ||
      (priorityBenchmark
        ? `Atuar sobre ${priorityBenchmark.metric} para reduzir o gap frente ao mercado.`
        : "Simplificar onboarding inicial para reduzir risco operacional e melhorar retenção."),
    opportunities:
      data.growth.recommendations.length +
      data.growth.marketTrends.length +
      data.growth.benchmarks.filter(isBelowMarket).length,
    relevantTrends: data.growth.marketTrends.filter(
      (trend) => trendScore(trend) > 0,
    ).length,
  };
}

function buildAnswer(question: string, data: CopilotData): CopilotAnswer {
  const normalizedQuestion = normalize(question);

  if (
    normalizedQuestion.includes("abaixo do mercado") ||
    normalizedQuestion.includes("benchmark")
  ) {
    const benchmarks = data.growth.benchmarks.filter(isBelowMarket);

    return {
      accounts: [],
      data: benchmarks.map(
        (benchmark) =>
          `${benchmark.metric}: KV Partners ${benchmark.kvValue} vs Mercado ${benchmark.marketValue}; diferença ${benchmark.difference}; impacto ${benchmark.impact}.`,
      ),
      recommendations: benchmarks.map(
        (benchmark) =>
          `Próximo passo: priorizar ${benchmark.metric} em ${benchmark.category}. ${benchmark.observation}`,
      ),
      summary:
        benchmarks.length > 0
          ? `${benchmarks.length} métrica(s) estão abaixo do mercado e indicam gaps estratégicos de execução.`
          : "Nenhum benchmark abaixo do mercado foi identificado nos dados atuais.",
    };
  }

  if (
    normalizedQuestion.includes("concorrente") ||
    normalizedQuestion.includes("competitivo")
  ) {
    const movements = topBy(
      data.growth.competitiveRadar,
      (movement) => (isHighPriority(movement.impact) ? 2 : 1),
      8,
    );

    return {
      accounts: [],
      data: movements.map(
        (movement) =>
          `${movement.competitor}: ${movement.movement} (${movement.category}, impacto ${movement.impact}).`,
      ),
      recommendations: movements.map(
        (movement) =>
          `Relevância: acompanhar ${movement.category} e comparar resposta da KV Partners com o movimento de ${movement.competitor}.`,
      ),
      summary:
        movements.length > 0
          ? `Foram identificados ${movements.length} movimentos competitivos relevantes para monitoramento executivo.`
          : "Nenhum movimento competitivo foi encontrado nos dados atuais.",
    };
  }

  if (
    normalizedQuestion.includes("tendencia") ||
    normalizedQuestion.includes("tendências")
  ) {
    const trends = topBy(data.growth.marketTrends, trendScore, 8);

    return {
      accounts: [],
      data: trends.map(
        (trend) =>
          `${trend.theme}: impacto ${trend.impact}, prioridade ${trend.priority}, direção ${trend.direction}.`,
      ),
      recommendations: trends.map(
        (trend) =>
          `Justificativa: ${trend.theme} aparece em ${trend.category} com fonte ${trend.source || "não informada"}.`,
      ),
      summary:
        trends.length > 0
          ? `${trends.length} tendência(s) merecem acompanhamento para orientar decisões de produto, risco e crescimento.`
          : "Nenhuma tendência de mercado foi encontrada nos dados atuais.",
    };
  }

  if (
    normalizedQuestion.includes("potencial de expansao") ||
    normalizedQuestion.includes("potencial de expansão")
  ) {
    const opportunities = topBy(data.risks, accountOpportunityScore, 5);

    return {
      accounts: opportunities.map((risk) => risk.accountName),
      data: opportunities.map(
        (risk, index) =>
          `${index + 1}. ${risk.accountName}: Opportunity Score ${accountOpportunityScore(risk)}, Health ${risk.healthScore}, Risk ${risk.riskScore}.`,
      ),
      recommendations: opportunities.map(
        (risk) =>
          `Justificativa: health alto com risco relativo controlado. Ação recomendada: ${risk.suggestedAction || "avaliar expansão comercial."}`,
      ),
      summary:
        opportunities.length > 0
          ? `${opportunities[0].accountName} lidera o ranking de expansão pelo maior Opportunity Score derivado de Health Score e Risk Score.`
          : "Nenhuma conta com potencial de expansão foi encontrada nos dados atuais.",
    };
  }

  if (normalizedQuestion.includes("upgrade")) {
    const candidates = topBy(data.risks, accountOpportunityScore, 5);

    return {
      accounts: candidates.map((risk) => risk.accountName),
      data: candidates.map((risk, index) => {
        const account = data.accounts.find(
          (row) => row.account === risk.accountName,
        );

        return `${index + 1}. ${risk.accountName}: plano ${account?.plan || "não informado"}, Opportunity Score ${accountOpportunityScore(risk)}.`;
      }),
      recommendations: candidates.map(
        (risk) =>
          `Oferta sugerida: avaliar upgrade para ${risk.accountName}. Justificativa: Health ${risk.healthScore}, Risk ${risk.riskScore} e contexto ${risk.mainReason.toLowerCase()}.`,
      ),
      summary:
        candidates.length > 0
          ? `${candidates[0].accountName} deve ser avaliada primeiro para oferta de upgrade, respeitando o contexto de risco do IOI.`
          : "Nenhum candidato a upgrade foi identificado nos dados atuais.",
    };
  }

  if (
    normalizedQuestion.includes("contas precisam") ||
    normalizedQuestion.includes("atenção") ||
    normalizedQuestion.includes("atencao") ||
    normalizedQuestion.includes("risco")
  ) {
    const riskyAccounts = topBy(data.risks, (risk) => risk.riskScore, 6);
    const delayedOnboardings = data.onboardings.filter(
      (onboarding) =>
        onboarding.risk === "Alto" ||
        onboarding.daysInProgress >= 14 ||
        onboarding.progress < 50,
    );

    return {
      accounts: riskyAccounts.map((risk) => risk.accountName),
      data: riskyAccounts.map((risk) => {
        const onboarding = delayedOnboardings.find(
          (row) => row.accountId === risk.accountId,
        );
        const onboardingContext = onboarding
          ? ` Onboarding: ${onboarding.progress}% em ${onboarding.daysInProgress} dias.`
          : "";

        return `${risk.accountName}: score ${risk.riskScore}, ${risk.riskLevel}. Motivo: ${risk.mainReason}.${onboardingContext}`;
      }),
      recommendations: riskyAccounts.map(
        (risk) => `Ação sugerida: ${risk.suggestedAction}`,
      ),
      summary:
        riskyAccounts.length > 0
          ? `${riskyAccounts.length} conta(s) combinam sinais de risco, saúde e onboarding para priorização executiva.`
          : "Nenhuma conta com atenção prioritária foi identificada.",
    };
  }

  if (
    normalizedQuestion.includes("iniciativa") &&
    (normalizedQuestion.includes("priorizar") ||
      normalizedQuestion.includes("90 dias"))
  ) {
    const initiatives = topBy(
      data.growth.recommendations,
      recommendationScore,
      5,
    );

    return {
      accounts: data.growth.insights
        .map((insight) => insight.accountName)
        .filter(Boolean)
        .slice(0, 5),
      data: initiatives.map(
        (initiative, index) =>
          `${index + 1}. ${initiative.recommendation}: prioridade ${initiative.priority}; impacto esperado ${initiative.estimatedImpact}.`,
      ),
      recommendations: initiatives.map(
        (initiative) =>
          `Motivo: iniciativa em ${initiative.area} com Opportunity Score ${initiative.opportunityScore}. Próximo passo: transformar em prioridade dos próximos 90 dias.`,
      ),
      summary:
        initiatives.length > 0
          ? `A iniciativa a priorizar nos próximos 90 dias é ${initiatives[0].recommendation}, pelo maior equilíbrio entre impacto, prioridade e oportunidade.`
          : "Nenhuma iniciativa priorizável foi encontrada nas recomendações atuais.",
    };
  }

  if (
    normalizedQuestion.includes("iniciativa") &&
    normalizedQuestion.includes("maior impacto")
  ) {
    const initiatives = topBy(
      data.growth.recommendations,
      recommendationScore,
      5,
    );

    return {
      accounts: [],
      data: initiatives.map(
        (initiative, index) =>
          `${index + 1}. ${initiative.recommendation}: motivo ${initiative.area}; impacto esperado ${initiative.estimatedImpact}; prioridade ${initiative.priority}.`,
      ),
      recommendations: initiatives.map(
        (initiative) =>
          `Iniciativa: ${initiative.recommendation}. Impacto esperado: ${initiative.estimatedImpact}. Prioridade: ${initiative.priority}.`,
      ),
      summary:
        initiatives.length > 0
          ? `A iniciativa com maior impacto esperado é ${initiatives[0].recommendation}, com prioridade ${initiatives[0].priority}.`
          : "Nenhuma iniciativa com impacto estimado foi encontrada nas recomendações atuais.",
    };
  }

  if (
    normalizedQuestion.includes("investir") ||
    normalizedQuestion.includes("90 dias")
  ) {
    const benchmarks = data.growth.benchmarks.filter(isBelowMarket).slice(0, 3);
    const trends = topBy(data.growth.marketTrends, trendScore, 3);
    const recommendations = topBy(
      data.growth.recommendations,
      recommendationScore,
      3,
    );
    const jobs = data.growth.jtbd.filter((job) =>
      isHighPriority(job.priority),
    );

    return {
      accounts: data.growth.insights
        .map((insight) => insight.accountName)
        .filter(Boolean)
        .slice(0, 5),
      data: [
        ...benchmarks.map(
          (benchmark) =>
            `Benchmark: ${benchmark.metric} está ${benchmark.difference} vs mercado (${benchmark.impact}).`,
        ),
        ...trends.map(
          (trend) =>
            `Tendência: ${trend.theme} (${trend.impact}, ${trend.priority}).`,
        ),
        ...jobs.slice(0, 3).map((job) => `JTBD: ${job.job} (${job.impact}).`),
      ],
      recommendations: recommendations.map(
        (recommendation) =>
          `Investir em ${recommendation.area}: ${recommendation.recommendation}. Impacto esperado: ${recommendation.estimatedImpact}. Próximo passo: converter em iniciativa de 90 dias.`,
      ),
      summary:
        recommendations.length > 0
          ? `Recomendação: priorizar ${recommendations[0].area} nos próximos 90 dias combinando benchmarks, tendências, JTBD, insights e recomendações.`
          : "Não há recomendações estratégicas suficientes para priorização de investimento.",
    };
  }

  if (
    normalizedQuestion.includes("funcionalidade") ||
    normalizedQuestion.includes("maior oportunidade")
  ) {
    const recommendations = topBy(
      data.growth.recommendations,
      recommendationScore,
      5,
    );

    return {
      accounts: data.growth.insights
        .map((insight) => insight.accountName)
        .filter(Boolean)
        .slice(0, 5),
      data: recommendations.map(
        (recommendation) =>
          `${recommendation.recommendation}: Índice de Oportunidade (Opportunity Score) ${recommendation.opportunityScore}, prioridade ${recommendation.priority}.`,
      ),
      recommendations: recommendations.map(
        (recommendation) =>
          `Impacto esperado: ${recommendation.estimatedImpact}. Próximo passo: envolver ${recommendation.area}.`,
      ),
      summary:
        recommendations.length > 0
          ? `A maior oportunidade aparece em ${recommendations[0].area}: ${recommendations[0].recommendation}.`
          : "Nenhuma oportunidade funcional foi encontrada nas recomendações atuais.",
    };
  }

  const recommendations = topBy(
    data.growth.recommendations,
    recommendationScore,
    5,
  );

  return {
    accounts: data.accounts.map((account) => account.account).slice(0, 5),
    data: [
      `JTBD monitorados: ${data.growth.jtbd.length}`,
      `Insights estratégicos: ${data.growth.insights.length}`,
      `Recomendações: ${data.growth.recommendations.length}`,
      `Tendências: ${data.growth.marketTrends.length}`,
      `Movimentos competitivos: ${data.growth.competitiveRadar.length}`,
      `Benchmarks: ${data.growth.benchmarks.length}`,
    ],
    recommendations: recommendations.map(
      (recommendation) =>
        `${recommendation.recommendation} (${recommendation.priority}, ${recommendation.estimatedImpact})`,
    ),
    summary:
      "O Copilot consolidou os módulos do ecossistema KV Partners e está pronto para responder perguntas executivas multi-fonte.",
  };
}

function buildSummaryItems(data: CopilotData) {
  const trends = topLabels(
    data.growth.marketTrends.filter((trend) => trendScore(trend) > 0),
    (trend) => trend.theme,
    3,
  );
  const competitors = topLabels(
    data.growth.competitiveRadar,
    (row) => row.competitor,
    3,
  );
  const benchmark = data.growth.benchmarks.find(isBelowMarket);
  const recommendation = topBy(
    data.growth.recommendations,
    recommendationScore,
    1,
  )[0];

  return [
    trends.length > 0
      ? `Tendências críticas identificadas: ${trends.join(", ")}.`
      : "Nenhuma tendência crítica foi identificada nos dados atuais.",
    competitors.length > 0
      ? `Concorrentes mais ativos: ${competitors.join(", ")}.`
      : "Nenhum movimento competitivo foi identificado nos dados atuais.",
    benchmark
      ? `Benchmark indica oportunidade de melhoria em ${benchmark.metric}.`
      : "Benchmarks não indicam gaps críticos de mercado no momento.",
    recommendation
      ? `Recomendação executiva: ${recommendation.recommendation}`
      : "Recomendações estratégicas ainda não possuem priorização suficiente.",
  ];
}

function topLabels<T>(
  rows: T[],
  getLabel: (row: T) => string,
  limit: number,
) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const label = getLabel(row);

    if (label) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((first, second) => second[1] - first[1])
    .slice(0, limit)
    .map(([label]) => label);
}

export function AICopilotCenter() {
  const [data, setData] = useState<CopilotData>({
    accounts: [],
    feedbacks: [],
    growth: emptyGrowth,
    onboardings: [],
    risks: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState(
    "Onde devemos investir nos próximos 90 dias?",
  );

  useEffect(() => {
    async function loadCopilotData() {
      try {
        const [accounts, onboardings, feedbacks, risks, growth] =
          await Promise.all([
            fetch("/api/accounts").then(
              (response) => response.json() as Promise<ExecutiveAccountsResponse>,
            ),
            fetch("/api/onboardings").then(
              (response) => response.json() as Promise<OnboardingsResponse>,
            ),
            fetch("/api/feedbacks").then(
              (response) => response.json() as Promise<FeedbacksResponse>,
            ),
            fetch("/api/risks").then(
              (response) => response.json() as Promise<RisksResponse>,
            ),
            fetch("/api/growth").then(
              (response) => response.json() as Promise<GrowthResponse>,
            ),
          ]);

        setData({
          accounts: accounts.accounts,
          feedbacks: feedbacks.feedbacks,
          growth: {
            ...emptyGrowth,
            ...growth,
            benchmarks: growth.benchmarks ?? [],
            competitiveRadar: growth.competitiveRadar ?? [],
            marketTrends: growth.marketTrends ?? [],
          },
          onboardings: onboardings.onboardings,
          risks: risks.risks,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadCopilotData();
  }, []);

  const answer = useMemo(() => buildAnswer(question, data), [data, question]);
  const briefing = useMemo(() => buildExecutiveBriefing(data), [data]);
  const summaryItems = useMemo(() => buildSummaryItems(data), [data]);
  const metrics = useMemo(
    () => [
      {
        detail: "Contas em /api/accounts",
        label: "Contas monitoradas",
        value: data.accounts.length,
      },
      {
        detail: "Benchmarks abaixo do mercado",
        label: "Gaps de mercado",
        value: data.growth.benchmarks.filter(isBelowMarket).length,
      },
      {
        detail: "Tendências e radar competitivo",
        label: "Sinais externos",
        value:
          data.growth.marketTrends.length +
          data.growth.competitiveRadar.length,
      },
      {
        detail: "JTBD, insights e recomendações",
        label: "Sinais estratégicos",
        value:
          data.growth.jtbd.length +
          data.growth.insights.length +
          data.growth.recommendations.length,
      },
    ],
    [data],
  );
  const { page, paginatedRows, setPage } = usePaginatedRows(answer.data);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Assistente estratégico
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              AI Copilot
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Faça perguntas executivas sobre contas, onboarding, feedbacks,
              riscos, JTBD, insights, recomendações, tendências, concorrentes e
              benchmarks da KV Partners.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <Bot className="size-4 text-zinc-950" />
            {isLoading ? "Carregando contexto" : "Motor de regras ativo"}
          </div>
        </div>
      </section>

      <ExecutiveBriefingPanel briefing={briefing} isLoading={isLoading} />

      <KPIGrid isLoading={isLoading} metrics={metrics} />

      <FilterBar>
        <div className="w-full">
          <label
            className="text-sm font-medium text-zinc-500"
            htmlFor="question"
          >
            Pergunta estratégica
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
              <Search className="size-4 text-zinc-400" />
              <input
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                id="question"
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Onde devemos investir nos próximos 90 dias?"
                value={question}
              />
            </div>
          </div>
        </div>
      </FilterBar>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {quickQuestions.map((quickQuestion) => (
          <button
            className="rounded-lg border border-zinc-200 bg-white p-4 text-left text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
            key={quickQuestion}
            onClick={() => setQuestion(quickQuestion)}
            type="button"
          >
            <Sparkles className="mb-3 size-4 text-zinc-950" />
            {quickQuestion}
          </button>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm">
          <p className="text-sm font-medium text-zinc-400">
            Resposta executiva
          </p>
          <p className="mt-4 text-xl font-semibold leading-8">
            {isLoading ? "Carregando dados reais..." : answer.summary}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Contas relacionadas
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(answer.accounts.length > 0 ? answer.accounts : ["Sem contas"]).map(
              (account, index) => (
                <span
                  className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700"
                  key={`${account}-${index}`}
                >
                  {account}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <AnswerList items={paginatedRows} title="Dados encontrados" />
        <AnswerList
          items={answer.recommendations}
          title="Recomendações e próximos passos"
        />
      </section>

      <Pagination
        currentPage={page}
        onPageChange={setPage}
        totalItems={answer.data.length}
      />

      <IntelligentSummary
        items={summaryItems}
        meta={[
          { label: "JTBD", value: data.growth.jtbd.length },
          { label: "Insights", value: data.growth.insights.length },
          { label: "Recomendações", value: data.growth.recommendations.length },
          { label: "Tendências", value: data.growth.marketTrends.length },
          { label: "Concorrentes", value: data.growth.competitiveRadar.length },
          { label: "Benchmarks", value: data.growth.benchmarks.length },
        ]}
      />
    </div>
  );
}

function ExecutiveBriefingPanel({
  briefing,
  isLoading,
}: {
  briefing: ExecutiveBriefing;
  isLoading: boolean;
}) {
  const items = [
    { label: "Saúde Média", value: briefing.averageHealth },
    { label: "Risco Médio", value: briefing.averageRisk },
    { label: "Contas em Risco", value: briefing.accountsAtRisk },
    { label: "Oportunidades Identificadas", value: briefing.opportunities },
    { label: "Métricas abaixo do benchmark", value: briefing.belowBenchmark },
    { label: "Tendências relevantes", value: briefing.relevantTrends },
  ];

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            Executive Briefing
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">
            Visão executiva consolidada
          </h2>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 lg:max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            Recomendação Principal
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-zinc-950">
            {isLoading ? "Carregando recomendação..." : briefing.mainRecommendation}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {items.map((item) => (
          <div
            className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"
            key={item.label}
          >
            <p className="text-xs text-zinc-500">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-950">
              {isLoading ? "..." : item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AnswerList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      </div>
      <div className="divide-y divide-zinc-100">
        {(items.length > 0 ? items : ["Nenhum dado encontrado."]).map(
          (item, index) => (
            <p className="px-5 py-4 text-sm leading-6 text-zinc-600" key={index}>
              {item}
            </p>
          ),
        )}
      </div>
    </div>
  );
}
