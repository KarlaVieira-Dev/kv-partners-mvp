"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import type {
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

const statusLabel = (status: TrafficStatus) =>
  status === "Vermelho"
    ? "Crítico"
    : status === "Amarelo"
      ? "Atenção"
      : "Saudável";

const opportunityScore = (healthScore: number, riskScore: number) =>
  Math.round(healthScore - riskScore * 0.5);

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

type TrafficStatus = "Verde" | "Amarelo" | "Vermelho";

type AttentionSignal = {
  impact: "Baixo" | "Médio" | "Alto";
  message: string;
};

type ExecutiveHealthItem = {
  area: string;
  reason: string;
  status: TrafficStatus;
};

type ExecutivePlanAction = {
  impact: string;
  owner: string;
  priority: string;
  reason: string;
  source?: string;
  status: TrafficStatus;
  suggestedAction?: string;
  title: string;
};

type ExpectedOutcome = {
  description: string;
  tone: TrafficStatus;
};

type InitiativeRanking = {
  area: string;
  expectedImpact: string;
  initiative: string;
  justification: string;
  position: number;
  priority: string;
  score: number;
};

const buildAttentionSignals = (
  risks: RiskRow[],
  onboardings: OnboardingsResponse["onboardings"],
  feedbacks: FeedbackRow[],
): AttentionSignal[] => {
  const onboardingRiskCount =
    risks.filter((risk) => risk.onboardingScore < 70).length +
    onboardings.filter((onboarding) => normalize(onboarding.risk).includes("alto"))
      .length;
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
      impact:
        onboardingRiskCount >= 2
          ? "Alto"
          : onboardingRiskCount === 1
            ? "Médio"
            : "Baixo",
      message:
        onboardingRiskCount > 0
          ? "Onboarding concentra o maior volume de risco atual e pode pressionar adoção, retenção e geração de valor."
          : "Onboarding não aparece como vetor dominante de risco no recorte atual.",
    },
    {
      impact:
        negativePermissionFeedbacks >= 2
          ? "Alto"
          : negativePermissionFeedbacks === 1
            ? "Médio"
            : "Baixo",
      message:
        negativePermissionFeedbacks > 0
          ? "Permissões e acessos concentram feedbacks negativos recorrentes e indicam fricção operacional."
          : "Permissões e acessos não concentram feedback negativo relevante no momento.",
    },
    {
      impact: averageHealth >= 70 ? "Baixo" : averageHealth >= 50 ? "Médio" : "Alto",
      message:
        averageHealth >= 70
          ? "A saúde média permanece satisfatória, mas contas com onboarding incompleto exigem monitoramento próximo."
          : "A saúde média exige atenção executiva porque pode limitar expansão e retenção.",
    },
  ];
};

const buildEcosystemHealth = (
  risks: RiskRow[],
  onboardings: OnboardingsResponse["onboardings"],
  feedbacks: FeedbackRow[],
): ExecutiveHealthItem[] => {
  const highRiskAccounts = risks.filter(isHighOrCriticalRisk);
  const criticalAccounts = risks.filter((risk) =>
    normalize(risk.riskLevel).includes("critico"),
  );
  const averageHealth = average(risks.map((risk) => risk.healthScore));
  const averageExpansion = average(
    risks.map((risk) => opportunityScore(risk.healthScore, risk.riskScore)),
  );
  const onboardingAttention = onboardings.filter(
    (onboarding) =>
      normalize(onboarding.risk).includes("alto") ||
      onboarding.daysInProgress >= 14 ||
      onboarding.progress < 50,
  );
  const negativeFeedbacks = feedbacks.filter((feedback) => {
    const text = normalize(
      `${feedback.sentiment} ${feedback.priority} ${feedback.theme} ${feedback.summary}`,
    );

    return (
      text.includes("negativo") ||
      text.includes("critico") ||
      text.includes("alta")
    );
  });

  return [
    {
      area: "Saúde das contas",
      reason:
        averageHealth >= 70
          ? `A maioria das contas apresenta saúde satisfatória, com Índice de Saúde médio em ${averageHealth}.`
          : `A saúde média está em ${averageHealth} e exige acompanhamento executivo.`,
      status: averageHealth >= 70 ? "Verde" : averageHealth >= 50 ? "Amarelo" : "Vermelho",
    },
    {
      area: "Crescimento",
      reason:
        averageExpansion >= 60
          ? "Existem oportunidades de expansão identificadas em contas saudáveis e com risco controlado."
          : "O potencial de expansão depende de redução de risco em contas relevantes.",
      status: averageExpansion >= 60 ? "Verde" : averageExpansion >= 40 ? "Amarelo" : "Vermelho",
    },
    {
      area: "Onboarding",
      reason:
        onboardingAttention.length > 0
          ? "Existem contas com onboarding incompleto, atraso ou baixa evolução."
          : "As jornadas de onboarding não apresentam alerta crítico no recorte atual.",
      status:
        onboardingAttention.length >= 3
          ? "Vermelho"
          : onboardingAttention.length > 0
            ? "Amarelo"
            : "Verde",
    },
    {
      area: "Feedback",
      reason:
        negativeFeedbacks.length > 0
          ? "Feedbacks negativos concentram sinais de fricção que podem afetar adoção."
          : "Não há concentração negativa relevante nos feedbacks atuais.",
      status:
        negativeFeedbacks.length >= 3
          ? "Vermelho"
          : negativeFeedbacks.length > 0
            ? "Amarelo"
            : "Verde",
    },
    {
      area: "Risco",
      reason:
        criticalAccounts.length > 0
          ? "Existem contas classificadas como Crítico e que exigem ação imediata."
          : highRiskAccounts.length > 0
            ? "Existem contas classificadas como Alto e que exigem monitoramento próximo."
            : "Não há contas em Alto ou Crítico no recorte atual.",
      status:
        criticalAccounts.length > 0
          ? "Vermelho"
          : highRiskAccounts.length > 0
            ? "Amarelo"
            : "Verde",
    },
  ];
};

const buildExpectedOutcomes = (
  priorityAccount: RiskRow | undefined,
  topOpportunity: RiskRow | undefined,
): ExpectedOutcome[] => [
  {
    description: priorityAccount
      ? `Redução do risco operacional em ${priorityAccount.accountName}.`
      : "Redução do risco operacional nas contas prioritárias.",
    tone: "Verde",
  },
  {
    description: "Melhoria da retenção ao atuar antes que a fricção vire perda de valor.",
    tone: "Verde",
  },
  {
    description: "Aumento da adoção ao simplificar jornadas críticas de onboarding.",
    tone: "Verde",
  },
  {
    description: topOpportunity
      ? `Potencial de expansão futura em ${topOpportunity.accountName}.`
      : "Potencial de expansão futura em contas saudáveis.",
    tone: "Amarelo",
  },
];

const buildExecutivePlan = (
  priorityAccount: RiskRow | undefined,
  topOpportunity: RiskRow | undefined,
  topInitiative: InitiativeRanking | undefined,
): ExecutivePlanAction[] => {
  const isCritical =
    priorityAccount && normalize(priorityAccount.riskLevel).includes("critico");

  return [
    {
      impact: "Retenção e adoção",
      owner: "Operação e Sucesso do Cliente",
      priority: isCritical ? "Imediata" : "Alta",
      reason: priorityAccount
        ? `${priorityAccount.mainReason}.`
        : "Sem conta crítica consolidada nas fontes atuais.",
      source: "07_IOI_Scores",
      status: isCritical ? "Vermelho" : "Amarelo",
      suggestedAction: priorityAccount?.suggestedAction,
      title: priorityAccount
        ? `Mitigar ${priorityAccount.accountName}`
        : "Mitigar conta mais crítica",
    },
    {
      impact: "Redução de atrito operacional",
      owner: topInitiative?.area || "Produto e Operações",
      priority: "Alta",
      reason: topInitiative
        ? topInitiative.justification
        : "Iniciativa estratégica ainda não consolidada.",
      status: "Amarelo",
      title: topInitiative?.initiative || "Priorizar iniciativa estratégica",
    },
    {
      impact: "Crescimento",
      owner: "Comercial e Estratégia",
      priority: "Oportunidade",
      reason: topOpportunity
        ? `Alta saúde relativa e risco controlado geram Potencial de Expansão ${opportunityScore(
            topOpportunity.healthScore,
            topOpportunity.riskScore,
          )}.`
        : "Sem oportunidade consolidada nas fontes atuais.",
      status: "Verde",
      title: topOpportunity
        ? `Expandir ${topOpportunity.accountName}`
        : "Avaliar oportunidade de expansão",
    },
  ];
};

const buildInitiativeRanking = (
  recommendations: GrowthRecommendationRow[],
  risks: RiskRow[],
  onboardings: OnboardingsResponse["onboardings"],
  feedbacks: FeedbackRow[],
): InitiativeRanking[] => {
  const highRiskCount = risks.filter(isHighOrCriticalRisk).length;
  const onboardingSignals =
    risks.filter((risk) => risk.onboardingScore < 70).length +
    onboardings.filter((onboarding) => normalize(onboarding.risk).includes("alto"))
      .length;
  const feedbackSignals = feedbacks.filter((feedback) => {
    const text = normalize(
      `${feedback.sentiment} ${feedback.priority} ${feedback.theme} ${feedback.summary}`,
    );

    return text.includes("negativo") || text.includes("crit") || text.includes("alta");
  }).length;

  return [...recommendations]
    .map((recommendation) => {
      const text = normalize(`${recommendation.recommendation} ${recommendation.area}`);
      const riskBonus = highRiskCount * 4;
      const onboardingBonus = text.includes("onboarding") ? onboardingSignals * 5 : 0;
      const feedbackBonus =
        text.includes("permiss") || text.includes("acesso") || text.includes("feedback")
          ? feedbackSignals * 4
          : 0;
      const priorityBonus = isPriority(recommendation.priority) ? 10 : 0;
      const score = Math.min(
        100,
        Math.round(
          recommendation.opportunityScore * 0.55 +
            riskBonus +
            onboardingBonus +
            feedbackBonus +
            priorityBonus,
        ),
      );

      return {
        area: recommendation.area,
        expectedImpact: recommendation.estimatedImpact,
        initiative: recommendation.recommendation,
        justification:
          onboardingBonus > 0
            ? "Principal fator de risco atual está conectado a onboarding."
            : feedbackBonus > 0
              ? "Sinais de feedback indicam fricção em permissões ou acessos."
              : "Recomendação conecta risco, expansão e prioridade estratégica.",
        priority: recommendation.priority,
        score,
      };
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, 3)
    .map((initiative, index) => ({
      ...initiative,
      position: index + 1,
    }));
};

export function ExecutiveCenter() {
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

  const priorityAccount = useMemo(
    () => [...risks].sort((first, second) => second.riskScore - first.riskScore)[0],
    [risks],
  );

  const topOpportunities = useMemo(
    () =>
      [...risks].sort(
        (first, second) =>
          opportunityScore(second.healthScore, second.riskScore) -
          opportunityScore(first.healthScore, first.riskScore),
      ),
    [risks],
  );

  const topOpportunity = topOpportunities[0];

  const attentionSignals = useMemo(
    () => buildAttentionSignals(risks, onboardings, feedbacks),
    [feedbacks, onboardings, risks],
  );

  const ecosystemHealth = useMemo(
    () => buildEcosystemHealth(risks, onboardings, feedbacks),
    [feedbacks, onboardings, risks],
  );

  const initiativeRanking = useMemo(
    () => buildInitiativeRanking(growth.recommendations, risks, onboardings, feedbacks),
    [feedbacks, growth.recommendations, onboardings, risks],
  );

  const executivePlan = useMemo(
    () => buildExecutivePlan(priorityAccount, topOpportunity, initiativeRanking[0]),
    [initiativeRanking, priorityAccount, topOpportunity],
  );

  const expectedOutcomes = useMemo(
    () => buildExpectedOutcomes(priorityAccount, topOpportunity),
    [priorityAccount, topOpportunity],
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <section className="rounded-lg border border-white/10 bg-[#050810] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">
              KV Partners | Centro de Decisão
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Quais decisões precisam ser tomadas agora?
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Uma jornada executiva para entender o problema, escolher a ação,
              antecipar impacto, observar sinais e avaliar a saúde do ecossistema.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0c1120] px-3 py-2 text-sm text-zinc-400">
            <Sparkles className="size-4 text-white" />
            {source === "google-sheets" ? "Google Sheets ativo" : "Planilha pronta"}
          </div>
        </div>
      </section>

      <DecisionStoryBlock
        isLoading={isLoading}
        priorityAccount={priorityAccount}
      />

      <ActionsStoryBlock actions={executivePlan} isLoading={isLoading} />

      <OutcomesStoryBlock
        actions={executivePlan}
        isLoading={isLoading}
        outcomes={expectedOutcomes}
      />

      <AttentionStoryBlock
        isLoading={isLoading}
        signals={attentionSignals}
      />

      <EcosystemHealthBlock
        isLoading={isLoading}
        items={ecosystemHealth}
      />
    </div>
  );
}

function StatusDot({ status }: { status: TrafficStatus }) {
  const statusClass = {
    Amarelo: "bg-amber-400 shadow-amber-200",
    Verde: "bg-emerald-500 shadow-emerald-200",
    Vermelho: "bg-red-500 shadow-red-200",
  }[status];

  return (
    <span
      className={cn("size-3 shrink-0 rounded-full shadow-[0_0_0_4px]", statusClass)}
    />
  );
}

function StatusPill({ status }: { status: TrafficStatus }) {
  const statusClass = {
    Amarelo: "bg-amber-50 text-amber-700",
    Verde: "bg-emerald-50 text-emerald-700",
    Vermelho: "bg-red-50 text-red-700",
  }[status];

  return (
    <span
      className={cn("rounded-md px-2 py-1 text-xs font-medium", statusClass)}
    >
      {statusLabel(status)}
    </span>
  );
}

function ImpactPill({ impact }: { impact: AttentionSignal["impact"] }) {
  const impactClass = {
    Alto: "bg-red-50 text-red-700",
    Baixo: "bg-emerald-50 text-emerald-700",
    Médio: "bg-amber-50 text-amber-700",
  }[impact];

  return (
    <span className={cn("rounded-md px-2 py-1 text-xs font-medium", impactClass)}>
      Impacto {impact}
    </span>
  );
}

function EmptyState() {
  return (
    <p className="text-sm leading-6 text-zinc-400">
      Sem dados suficientes nas fontes atuais.
    </p>
  );
}

function NarrativeBlock({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#050810] p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DecisionStoryBlock({
  isLoading,
  priorityAccount,
}: {
  isLoading: boolean;
  priorityAccount: RiskRow | undefined;
}) {
  return (
    <NarrativeBlock
      eyebrow="Principal problema atual"
      title="🚨 O que está acontecendo?"
    >
      {isLoading ? (
        <EmptyState />
      ) : priorityAccount ? (
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
          <div className="rounded-lg border border-red-100 bg-red-50/60 p-4">
            <p className="text-lg font-semibold leading-7 text-white">
              {priorityAccount.accountName} apresenta{" "}
              {priorityAccount.mainReason.toLowerCase()}.
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              Isso elevou o Índice de Risco para{" "}
              <strong className="font-semibold text-white">
                {priorityAccount.riskScore} ({priorityAccount.riskLevel})
              </strong>
              .
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              Impacto potencial: retenção, adoção e geração de valor.
            </p>
          </div>
          <div className="flex flex-col justify-between rounded-lg border border-zinc-100 bg-[#0c1120] p-4">
            <div>
              <p className="text-sm font-medium text-zinc-400">
                Ação sugerida
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white">
                {priorityAccount.suggestedAction ||
                  "Atuar sobre o principal vetor de risco identificado."}
              </p>
            </div>
            <p className="mt-4 text-xs font-medium text-zinc-400">
              Fonte oficial: 07_IOI_Scores
            </p>
          </div>
        </div>
      ) : (
        <EmptyState />
      )}
    </NarrativeBlock>
  );
}

function ActionsStoryBlock({
  actions,
  isLoading,
}: {
  actions: ExecutivePlanAction[];
  isLoading: boolean;
}) {
  return (
    <NarrativeBlock
      eyebrow="Próxima decisão"
      title="📋 O que devemos fazer?"
    >
      {isLoading || actions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {actions.map((action, index) => (
            <article
              className="rounded-lg border border-zinc-100 bg-[#0c1120] p-4"
              key={action.title}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-lg font-semibold text-white">
                  {index + 1}
                </span>
                <StatusPill status={action.status} />
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-white">
                {action.title}
              </p>
              <p className="mt-2 text-sm leading-5 text-zinc-400">
                Motivo: {action.reason}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-400">
                Responsável: {action.owner}
              </p>
            </article>
          ))}
        </div>
      )}
    </NarrativeBlock>
  );
}

function OutcomesStoryBlock({
  actions,
  isLoading,
  outcomes,
}: {
  actions: ExecutivePlanAction[];
  isLoading: boolean;
  outcomes: ExpectedOutcome[];
}) {
  const mainAction = actions[0];

  return (
    <NarrativeBlock
      eyebrow="Impacto esperado"
      title="🎯 O que acontece se fizermos?"
    >
      {isLoading || !mainAction ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-zinc-100 bg-[#0c1120] p-4">
            <p className="text-sm font-medium text-zinc-400">
              Ação principal
            </p>
            <p className="mt-2 text-lg font-semibold leading-7 text-white">
              {mainAction.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Impacto esperado: {mainAction.impact}.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {outcomes.map((outcome) => (
              <div
                className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-[#050810] p-3"
                key={outcome.description}
              >
                <StatusDot status={outcome.tone} />
                <p className="text-sm leading-5 text-zinc-700">
                  {outcome.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </NarrativeBlock>
  );
}

function AttentionStoryBlock({
  isLoading,
  signals,
}: {
  isLoading: boolean;
  signals: AttentionSignal[];
}) {
  return (
    <NarrativeBlock
      eyebrow="Sinais executivos"
      title="📡 O que está chamando atenção agora"
    >
      {isLoading || signals.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {signals.map((signal) => (
            <article
              className="rounded-lg border border-zinc-100 bg-[#0c1120] p-4"
              key={signal.message}
            >
              <div className="flex items-center justify-between gap-3">
                <StatusDot
                  status={
                    signal.impact === "Alto"
                      ? "Vermelho"
                      : signal.impact === "Médio"
                        ? "Amarelo"
                        : "Verde"
                  }
                />
                <ImpactPill impact={signal.impact} />
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-700">
                {signal.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </NarrativeBlock>
  );
}

function EcosystemHealthBlock({
  isLoading,
  items,
}: {
  isLoading: boolean;
  items: ExecutiveHealthItem[];
}) {
  return (
    <NarrativeBlock
      eyebrow="Estado geral"
      title="🚦 Saúde do ecossistema"
    >
      {isLoading || items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 md:grid-cols-5">
          {items.map((item) => (
            <article
              className="rounded-lg border border-zinc-100 bg-[#0c1120] p-3"
              key={item.area}
            >
              <div className="flex items-center justify-between gap-3">
                <StatusDot status={item.status} />
                <StatusPill status={item.status} />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                {item.area}
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-400">
                {item.reason}
              </p>
            </article>
          ))}
        </div>
      )}
    </NarrativeBlock>
  );
}
