"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import type {
  ExecutiveAccountRow,
  ExecutiveAccountsResponse,
  FeedbackRow,
  FeedbacksResponse,
  GrowthRecommendationRow,
  GrowthResponse,
  OnboardingsResponse,
  RiskRow,
  RisksResponse,
} from "@/lib/google-sheets/types";
import { cn } from "@/lib/utils";
import { IntelligentSummary, KPIGrid } from "./shared";

const average = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  );
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const isHighOrCriticalRisk = (risk: RiskRow) => {
  const normalized = normalize(risk.riskLevel);

  return normalized.includes("alto") || normalized.includes("critico");
};

const isPriority = (value: string) => {
  const normalized = normalize(value);

  return (
    normalized.includes("alta") ||
    normalized.includes("critica") ||
    normalized.includes("critico") ||
    normalized.includes("prioritaria")
  );
};

const riskColor = (level: string) => {
  const normalized = normalize(level);

  if (normalized.includes("critico")) {
    return "bg-red-50 text-red-700";
  }

  if (normalized.includes("alto")) {
    return "bg-rose-50 text-rose-700";
  }

  if (normalized.includes("medio")) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
};

const opportunityScore = (healthScore: number, riskScore: number) =>
  Math.round(healthScore - riskScore * 0.5);

const unique = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const emptyGrowth: GrowthResponse = {
  benchmarks: [],
  competitiveRadar: [],
  insights: [],
  jtbd: [],
  marketTrends: [],
  radar: {
    expansion: 0,
    operationalEfficiency: 0,
    retention: 0,
  },
  recommendations: [],
  source: "not-configured",
};

type TrendSignal = {
  description: string;
  direction: "↑" | "↓" | "→";
  impact: "Baixo" | "Médio" | "Alto";
  justification: string;
};

type InitiativeImpact = {
  initiative: string;
  expectedImpact: string;
  priority: string;
  justification: string;
};

const buildTrendSignals = (
  risks: RiskRow[],
  onboardings: OnboardingsResponse["onboardings"],
  feedbacks: FeedbackRow[],
): TrendSignal[] => {
  const onboardingRiskCount =
    risks.filter((risk) => risk.onboardingScore < 70).length +
    onboardings.filter((onboarding) => normalize(onboarding.risk).includes("alto")).length;
  const negativePermissionFeedbacks = feedbacks.filter((feedback) => {
    const text = normalize(
      `${feedback.sentiment} ${feedback.priority} ${feedback.category} ${feedback.theme} ${feedback.summary}`,
    );

    return (
      text.includes("negativo") &&
      (text.includes("permiss") || text.includes("acesso"))
    );
  }).length;
  const averageHealth = average(risks.map((risk) => risk.healthScore));

  return [
    {
      description: "Risco concentrado em onboarding",
      direction: onboardingRiskCount > 0 ? "↑" : "→",
      impact: onboardingRiskCount >= 2 ? "Alto" : onboardingRiskCount === 1 ? "Médio" : "Baixo",
      justification:
        onboardingRiskCount > 0
          ? `${onboardingRiskCount} sinal(is) conectam risco atual a onboarding.`
          : "Não há concentração relevante em onboarding no recorte atual.",
    },
    {
      description: "Feedback negativo em permissões",
      direction: negativePermissionFeedbacks > 0 ? "↑" : "→",
      impact: negativePermissionFeedbacks >= 2 ? "Alto" : negativePermissionFeedbacks === 1 ? "Médio" : "Baixo",
      justification:
        negativePermissionFeedbacks > 0
          ? `${negativePermissionFeedbacks} feedback(s) conectam sentimento negativo a permissões ou acessos.`
          : "Sem recorrência negativa relevante em permissões nas fontes atuais.",
    },
    {
      description: "Health Score estável",
      direction: "→",
      impact: averageHealth >= 70 ? "Baixo" : averageHealth >= 50 ? "Médio" : "Alto",
      justification: `Média atual de Health Score em ${averageHealth}, sem histórico temporal suficiente para afirmar evolução real.`,
    },
  ];
};

const buildInitiativeImpacts = (
  recommendations: GrowthRecommendationRow[],
  highRiskAccounts: RiskRow[],
): InitiativeImpact[] => {
  const recommendationInitiatives = [...recommendations]
    .sort((first, second) => second.opportunityScore - first.opportunityScore)
    .slice(0, 3)
    .map((recommendation) => ({
      expectedImpact: recommendation.estimatedImpact,
      initiative: recommendation.recommendation,
      justification: `Priorizada em ${recommendation.area} com Opportunity Score ${recommendation.opportunityScore}.`,
      priority: recommendation.priority,
    }));

  if (recommendationInitiatives.length > 0) {
    return recommendationInitiatives;
  }

  return highRiskAccounts.slice(0, 3).map((risk) => ({
    expectedImpact:
      "reduz fricção operacional, aumenta adoção e reduz exposição de risco.",
    initiative: risk.suggestedAction || `Atuar sobre ${risk.accountName}`,
    justification: `${risk.accountName} está em ${risk.riskLevel} por ${risk.mainReason}.`,
    priority: risk.riskLevel,
  }));
};

export function ExecutiveCenter() {
  const [accounts, setAccounts] = useState<ExecutiveAccountRow[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRow[]>([]);
  const [risks, setRisks] = useState<RiskRow[]>([]);
  const [onboardings, setOnboardings] = useState<OnboardingsResponse["onboardings"]>([]);
  const [growth, setGrowth] = useState<GrowthResponse>(emptyGrowth);
  const [source, setSource] =
    useState<ExecutiveAccountsResponse["source"]>("not-configured");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadExecutiveData() {
      try {
        const [
          accountsResponse,
          feedbacksResponse,
          risksResponse,
          onboardingsResponse,
          growthResponse,
        ] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/feedbacks"),
          fetch("/api/risks"),
          fetch("/api/onboardings"),
          fetch("/api/growth"),
        ]);

        const accountsData =
          (await accountsResponse.json()) as ExecutiveAccountsResponse;
        const feedbacksData = (await feedbacksResponse.json()) as FeedbacksResponse;
        const risksData = (await risksResponse.json()) as RisksResponse;
        const onboardingsData =
          (await onboardingsResponse.json()) as OnboardingsResponse;
        const growthData = (await growthResponse.json()) as GrowthResponse;

        setAccounts(accountsData.accounts);
        setFeedbacks(feedbacksData.feedbacks);
        setRisks(risksData.risks);
        setOnboardings(onboardingsData.onboardings);
        setGrowth(growthData);
        setSource(accountsData.source);
      } finally {
        setIsLoading(false);
      }
    }

    loadExecutiveData();
  }, []);

  const highRiskAccounts = useMemo(
    () => risks.filter(isHighOrCriticalRisk),
    [risks],
  );

  const priorityAccount = useMemo(
    () => [...risks].sort((first, second) => second.riskScore - first.riskScore)[0],
    [risks],
  );

  const riskAverage = useMemo(
    () => average(risks.map((risk) => risk.riskScore)),
    [risks],
  );

  const healthAverage = useMemo(
    () => average(risks.map((risk) => risk.healthScore)),
    [risks],
  );

  const metrics = useMemo(
    () => [
      {
        detail: "Derivado de 07_IOI_Scores",
        label: "Risco médio",
        value: riskAverage,
      },
      {
        detail: "Alto ou Crítico",
        label: "Contas em risco",
        value: highRiskAccounts.length,
      },
      {
        detail: "Contas com Health Score disponível",
        label: "Saúde média",
        value: healthAverage,
      },
      {
        detail: "Ações registradas nas fontes atuais",
        label: "Ações sugeridas",
        value: risks.filter((risk) => risk.suggestedAction).length,
      },
    ],
    [healthAverage, highRiskAccounts.length, riskAverage, risks],
  );

  const strategicPriorities = useMemo(() => {
    const recommendationPriorities = growth.recommendations
      .filter((recommendation) => isPriority(recommendation.priority))
      .map((recommendation) => recommendation.recommendation);
    const riskPriorities = highRiskAccounts.map((risk) => risk.suggestedAction);
    const onboardingPriorities = onboardings
      .filter((onboarding) => normalize(onboarding.risk).includes("alto"))
      .map((onboarding) => onboarding.nextAction);

    return unique([
      ...recommendationPriorities,
      ...riskPriorities,
      ...onboardingPriorities,
    ]).slice(0, 4);
  }, [growth.recommendations, highRiskAccounts, onboardings]);

  const topOpportunities = useMemo(
    () =>
      [...risks]
        .sort(
          (first, second) =>
            opportunityScore(second.healthScore, second.riskScore) -
            opportunityScore(first.healthScore, first.riskScore),
        )
        .slice(0, 3),
    [risks],
  );

  const trendSignals = useMemo(
    () => buildTrendSignals(risks, onboardings, feedbacks),
    [feedbacks, onboardings, risks],
  );

  const initiativeImpacts = useMemo(
    () => buildInitiativeImpacts(growth.recommendations, highRiskAccounts),
    [growth.recommendations, highRiskAccounts],
  );

  const noActionConsequence = priorityAccount
    ? `Sem ação, ${priorityAccount.accountName} tende a manter ${priorityAccount.riskLevel.toLowerCase()} com risco ${priorityAccount.riskScore}, prolongando ${priorityAccount.mainReason.toLowerCase()}.`
    : "Sem dados de risco suficientes para projetar consequência.";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              KV Partners | Camada executiva e operacional
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Quais decisões precisam ser tomadas agora?
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Uma leitura executiva sobre atenção imediata, mudança, investimento,
              oportunidade e consequência.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <Sparkles className="size-4 text-zinc-950" />
            {source === "google-sheets" ? "Google Sheets ativo" : "Planilha pronta"}
          </div>
        </div>
      </section>

      <KPIGrid isLoading={isLoading} metrics={metrics} />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <QuestionBlock
          eyebrow="1. O que exige atenção agora?"
          title={priorityAccount?.accountName ?? "Nenhuma conta prioritária"}
        >
          {priorityAccount ? (
            <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
              <div className="flex flex-wrap gap-2">
                <Badge>Risk Score {priorityAccount.riskScore}</Badge>
                <span
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium",
                    riskColor(priorityAccount.riskLevel),
                  )}
                >
                  {priorityAccount.riskLevel}
                </span>
              </div>
              <div className="space-y-3 text-sm leading-6 text-zinc-600">
                <p>
                  <strong className="text-zinc-950">Motivo:</strong>{" "}
                  {priorityAccount.mainReason}
                </p>
                <p>
                  <strong className="text-zinc-950">Ação sugerida:</strong>{" "}
                  {priorityAccount.suggestedAction}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </QuestionBlock>

        <QuestionBlock
          eyebrow="2. O que mudou?"
          title="Tendências identificadas"
        >
          <TrendList trends={trendSignals} />
          <p className="mt-4 text-xs leading-5 text-zinc-500">
            Leitura baseada no recorte atual das fontes. Onde não há histórico
            temporal suficiente, a variação é tratada como sinal de tendência
            para demonstração.
          </p>
        </QuestionBlock>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <QuestionBlock eyebrow="3. Onde investir?" title="Prioridades estratégicas">
          <List
            empty="Sem recomendações priorizadas nas fontes atuais."
            items={strategicPriorities}
          />
        </QuestionBlock>

        <QuestionBlock
          eyebrow="4. Quem possui maior potencial de expansão?"
          title="Top Oportunidades de Expansão"
        >
          {topOpportunities.length > 0 ? (
            <div className="space-y-3">
              {topOpportunities.map((opportunity) => (
                <div
                  className="border-t border-zinc-100 pt-3 first:border-t-0 first:pt-0"
                  key={opportunity.accountId}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-950">
                      {opportunity.accountName}
                    </p>
                    <Badge>
                      Opportunity Score{" "}
                      {opportunityScore(
                        opportunity.healthScore,
                        opportunity.riskScore,
                      )}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Motivo: Health alto combinado ao risco atual. Próxima ação:{" "}
                    {opportunity.suggestedAction ||
                      "avaliar expansão comercial com base no contexto da conta."}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </QuestionBlock>

        <QuestionBlock
          eyebrow="5. O que acontece se não fizermos nada?"
          title="Consequência provável"
        >
          <p className="text-sm leading-6 text-zinc-600">
            {noActionConsequence}
          </p>
          {priorityAccount?.suggestedAction ? (
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              A ação recomendada reduz a chance de atraso na geração de valor,
              fricção operacional e impacto em adoção ou retenção.
            </p>
          ) : null}
        </QuestionBlock>
      </section>

      <QuestionBlock
        eyebrow="Decision Intelligence"
        title="Impacto esperado das iniciativas"
      >
        <InitiativeImpactList initiatives={initiativeImpacts} />
      </QuestionBlock>

      <IntelligentSummary
        items={[
          "A priorização executiva parte do IOI e mantém 07_IOI_Scores como fonte oficial de risco.",
          "Tendências sem histórico real são marcadas como sinal ou variação simulada para demonstração.",
          "Investimento e oportunidade usam recomendações, insights e contas já existentes nas fontes atuais.",
        ]}
        meta={[
          { label: "Origem dos dados", value: source === "google-sheets" ? "Google Sheets" : "Planilha pendente" },
          { label: "Contas lidas", value: accounts.length },
          { label: "Riscos IOI", value: risks.length },
          { label: "Contas em risco", value: highRiskAccounts.length },
        ]}
      />
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
      {children}
    </span>
  );
}

function EmptyState() {
  return (
    <p className="text-sm leading-6 text-zinc-500">
      Sem dados suficientes nas fontes atuais.
    </p>
  );
}

function List({ empty, items }: { empty: string; items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm leading-6 text-zinc-500">{empty}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <p
          className="border-t border-zinc-100 pt-3 text-sm leading-6 text-zinc-600 first:border-t-0 first:pt-0"
          key={item}
        >
          {item}
        </p>
      ))}
    </div>
  );
}

function QuestionBlock({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TrendList({ trends }: { trends: TrendSignal[] }) {
  return (
    <div className="space-y-3">
      {trends.map((trend) => (
        <div
          className="border-t border-zinc-100 pt-3 first:border-t-0 first:pt-0"
          key={trend.description}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-zinc-950">
              {trend.direction}
            </span>
            <p className="text-sm font-semibold text-zinc-950">
              {trend.description}
            </p>
            <Badge>Impacto {trend.impact}</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {trend.justification}
          </p>
        </div>
      ))}
    </div>
  );
}

function InitiativeImpactList({
  initiatives,
}: {
  initiatives: InitiativeImpact[];
}) {
  if (initiatives.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {initiatives.map((initiative) => (
        <article
          className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
          key={initiative.initiative}
        >
          <p className="text-sm font-semibold text-zinc-950">
            {initiative.initiative}
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Impacto esperado: {initiative.expectedImpact}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Justificativa: {initiative.justification}
          </p>
          <div className="mt-3">
            <Badge>Prioridade {initiative.priority}</Badge>
          </div>
        </article>
      ))}
    </div>
  );
}
