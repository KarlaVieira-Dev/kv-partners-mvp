"use client";

import { Bot, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  ExecutiveAccountRow,
  ExecutiveAccountsResponse,
  FeedbackRow,
  FeedbacksResponse,
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

const quickQuestions = [
  "Contas em risco",
  "Onboardings críticos",
  "Feedbacks críticos",
  "Oportunidades de expansão",
  "Recomendações prioritárias",
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

const topBy = <T,>(items: T[], score: (item: T) => number, limit = 5) =>
  [...items].sort((first, second) => score(second) - score(first)).slice(0, limit);

function buildAnswer(question: string, data: CopilotData): CopilotAnswer {
  const normalizedQuestion = normalize(question);

  if (normalizedQuestion.includes("onboarding")) {
    const criticalOnboardings = data.onboardings.filter(
      (onboarding) =>
        onboarding.risk === "Alto" ||
        onboarding.daysInProgress >= 14 ||
        onboarding.progress < 50,
    );

    return {
      accounts: criticalOnboardings.map((onboarding) => onboarding.account),
      data: criticalOnboardings.map(
        (onboarding) =>
          `${onboarding.account}: ${onboarding.progress}% em ${onboarding.daysInProgress} dias (${onboarding.status})`,
      ),
      recommendations: criticalOnboardings.map(
        (onboarding) => onboarding.nextAction,
      ),
      summary:
        criticalOnboardings.length > 0
          ? `${criticalOnboardings.length} onboarding(s) exigem atenção por risco alto, baixa conclusão ou tempo elevado.`
          : "Nenhum onboarding crítico foi identificado com as regras atuais.",
    };
  }

  if (normalizedQuestion.includes("feedback")) {
    const criticalFeedbacks = data.feedbacks.filter((feedback) => {
      const priority = normalize(feedback.priority);
      const sentiment = normalize(feedback.sentiment);
      return priority.includes("crit") || sentiment.includes("negativo");
    });

    return {
      accounts: criticalFeedbacks.map((feedback) => feedback.accountName),
      data: criticalFeedbacks.map(
        (feedback) =>
          `${feedback.accountName}: ${feedback.theme} (${feedback.sentiment}, ${feedback.priority})`,
      ),
      recommendations: criticalFeedbacks.map((feedback) => feedback.summary),
      summary:
        criticalFeedbacks.length > 0
          ? `${criticalFeedbacks.length} feedback(s) críticos ou negativos indicam fricções relevantes na experiência.`
          : "Nenhum feedback crítico foi identificado com as regras atuais.",
    };
  }

  if (
    normalizedQuestion.includes("oportunidade") ||
    normalizedQuestion.includes("expansao") ||
    normalizedQuestion.includes("recomend")
  ) {
    const recommendations = topBy(
      data.growth.recommendations,
      (recommendation) => recommendation.opportunityScore,
    );

    return {
      accounts: data.growth.insights
        .map((insight) => insight.accountName)
        .filter(Boolean)
        .slice(0, 5),
      data: recommendations.map(
        (recommendation) =>
          `${recommendation.recommendation}: score ${recommendation.opportunityScore} (${recommendation.priority})`,
      ),
      recommendations: recommendations.map(
        (recommendation) =>
          `${recommendation.area}: ${recommendation.estimatedImpact} impacto estimado`,
      ),
      summary:
        recommendations.length > 0
          ? `As maiores oportunidades estão concentradas em ${recommendations.length} recomendação(ões) estratégicas priorizadas.`
          : "Nenhuma recomendação estratégica foi encontrada nos dados atuais.",
    };
  }

  const riskyAccounts = topBy(
    data.risks,
    (risk) => risk.riskScore,
  ).filter((risk) => risk.riskScore >= 50 || normalize(risk.riskLevel).includes("alto"));

  return {
    accounts: riskyAccounts.map((risk) => risk.accountName),
    data: riskyAccounts.map(
      (risk) =>
        `${risk.accountName}: Índice de Risco (Risk Score) ${risk.riskScore}, Índice de Saúde (Health Score) ${risk.healthScore}, ${risk.riskLevel}`,
    ),
    recommendations: riskyAccounts.map((risk) => risk.suggestedAction),
    summary:
      riskyAccounts.length > 0
        ? `${riskyAccounts.length} conta(s) aparecem com maior exposição de risco e devem ser priorizadas.`
        : "Nenhuma conta com risco relevante foi identificada com as regras atuais.",
  };
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
  const [question, setQuestion] = useState("Quais contas possuem maior risco?");

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
          growth,
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
  const metrics = useMemo(
    () => [
      {
        detail: "Contexto de contas",
        label: "Contas monitoradas",
        value: data.accounts.length,
      },
      {
        detail: "Sinais de risco disponiveis",
        label: "Riscos analisados",
        value: data.risks.length,
      },
      {
        detail: "Jornadas em acompanhamento",
        label: "Onboardings lidos",
        value: data.onboardings.length,
      },
      {
        detail: "Voz do cliente",
        label: "Feedbacks lidos",
        value: data.feedbacks.length,
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
              Faça perguntas estratégicas sobre risco de contas, onboarding,
              feedbacks e oportunidades de crescimento usando os dados atuais
              da KV Partners.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <Bot className="size-4 text-zinc-950" />
            {isLoading ? "Carregando contexto" : "Motor de regras ativo"}
          </div>
        </div>
      </section>

      <KPIGrid isLoading={isLoading} metrics={metrics} />

      <FilterBar>
        <div className="w-full">
          <label
            className="text-sm font-medium text-zinc-500"
            htmlFor="question"
          >
            Pergunta
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
              <Search className="size-4 text-zinc-400" />
              <input
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                id="question"
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Quais contas possuem maior risco?"
                value={question}
              />
            </div>
          </div>
        </div>
      </FilterBar>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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
          title="Recomendações relacionadas"
        />
      </section>

      <Pagination
        currentPage={page}
        onPageChange={setPage}
        totalItems={answer.data.length}
      />

      <IntelligentSummary
        items={[
          "O Copilot ainda opera por regras e consultas sobre os dados reais disponíveis.",
          "As respostas combinam sinais de risco, onboarding, feedback e crescimento sem chamada a IA externa.",
          "A próxima evolução natural é conectar o motor a uma camada generativa com contexto controlado.",
        ]}
        meta={[
          { label: "Pergunta ativa", value: question },
          { label: "Dados encontrados", value: answer.data.length },
        ]}
      />
    </div>
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
