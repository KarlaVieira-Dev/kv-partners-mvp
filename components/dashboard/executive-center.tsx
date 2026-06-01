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

type TrendSignal = {
  description: string;
  direction: "↑" | "↓" | "→";
  impact: "Baixo" | "Médio" | "Alto";
  justification: string;
};

type TrafficStatus = "Verde" | "Amarelo" | "Vermelho";

type ExecutivePulseItem = {
  area: string;
  metric: string;
  reason: string;
  status: TrafficStatus;
  trend: "↑" | "↓" | "→";
};

type ExecutivePlanAction = {
  impact: string;
  reason: string;
  source?: string;
  status: TrafficStatus;
  suggestedAction?: string;
  suggestedDeadline: string;
  title: string;
};

type ImpactSemaphore = {
  area: string;
  explanation: string;
  expectedImpact: "Alto" | "Médio" | "Baixo";
  status: TrafficStatus;
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
      description: "Índice de Saúde estável",
      direction: "→",
      impact: averageHealth >= 70 ? "Baixo" : averageHealth >= 50 ? "Médio" : "Alto",
      justification: `Média atual do Índice de Saúde em ${averageHealth}, sem histórico temporal suficiente para afirmar evolução real.`,
    },
  ];
};

const buildExecutivePulse = (
  risks: RiskRow[],
  onboardings: OnboardingsResponse["onboardings"],
  feedbacks: FeedbackRow[],
): ExecutivePulseItem[] => {
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
      area: "Crescimento",
      metric: `${averageExpansion} de Potencial de Expansão médio`,
      reason:
        averageExpansion >= 60
          ? "contas saudáveis com risco controlado"
          : "oportunidades ainda dependem de redução de risco",
      status: averageExpansion >= 60 ? "Verde" : averageExpansion >= 40 ? "Amarelo" : "Vermelho",
      trend: averageExpansion >= 60 ? "↑" : "→",
    },
    {
      area: "Saúde",
      metric: `${averageHealth} de Índice de Saúde médio`,
      reason:
        averageHealth >= 70
          ? "base monitorada mantém saúde positiva"
          : "saúde média exige acompanhamento executivo",
      status: averageHealth >= 70 ? "Verde" : averageHealth >= 50 ? "Amarelo" : "Vermelho",
      trend: "→",
    },
    {
      area: "Onboarding",
      metric: `${onboardingAttention.length} conta(s) exigem atenção`,
      reason:
        onboardingAttention.length > 0
          ? "há jornadas com risco, atraso ou baixa evolução"
          : "jornadas sem alerta crítico no recorte atual",
      status: onboardingAttention.length >= 3 ? "Vermelho" : onboardingAttention.length > 0 ? "Amarelo" : "Verde",
      trend: onboardingAttention.length > 0 ? "↑" : "→",
    },
    {
      area: "Feedback",
      metric: `${negativeFeedbacks.length} sinal(is) negativos ou críticos`,
      reason:
        negativeFeedbacks.length > 0
          ? "feedbacks indicam fricção recorrente"
          : "sem concentração negativa relevante",
      status: negativeFeedbacks.length >= 3 ? "Vermelho" : negativeFeedbacks.length > 0 ? "Amarelo" : "Verde",
      trend: negativeFeedbacks.length > 0 ? "↑" : "→",
    },
    {
      area: "Risco",
      metric: `${highRiskAccounts.length} conta(s) em alto risco ou crítico`,
      reason:
        criticalAccounts.length > 0
          ? "há conta crítica exigindo ação imediata"
          : "risco concentrado abaixo do nível crítico",
      status: criticalAccounts.length > 0 ? "Vermelho" : highRiskAccounts.length > 0 ? "Amarelo" : "Verde",
      trend: highRiskAccounts.length > 0 ? "↑" : "→",
    },
  ];
};

const buildImpactSemaphores = (
  risks: RiskRow[],
  onboardings: OnboardingsResponse["onboardings"],
  feedbacks: FeedbackRow[],
): ImpactSemaphore[] => {
  const highRiskCount = risks.filter(isHighOrCriticalRisk).length;
  const onboardingAttention = onboardings.filter(
    (onboarding) =>
      normalize(onboarding.risk).includes("alto") ||
      onboarding.daysInProgress >= 14 ||
      onboarding.progress < 50,
  ).length;
  const averageExpansion = average(
    risks.map((risk) => opportunityScore(risk.healthScore, risk.riskScore)),
  );
  const permissionFeedbacks = feedbacks.filter((feedback) =>
    normalize(`${feedback.theme} ${feedback.summary} ${feedback.category}`).includes(
      "permiss",
    ),
  ).length;

  return [
    {
      area: "Retenção",
      explanation:
        highRiskCount > 0
          ? "redução de risco nas contas críticas e em alto risco"
          : "manutenção da base saudável monitorada",
      expectedImpact: highRiskCount > 0 ? "Alto" : "Médio",
      status: highRiskCount > 0 ? "Verde" : "Amarelo",
    },
    {
      area: "Adoção",
      explanation:
        onboardingAttention > 0
          ? "simplificação de jornadas de onboarding com atenção"
          : "continuidade da evolução inicial das contas",
      expectedImpact: onboardingAttention > 0 ? "Alto" : "Médio",
      status: onboardingAttention > 0 ? "Verde" : "Amarelo",
    },
    {
      area: "Receita / Expansão",
      explanation: "contas saudáveis prontas para abordagem comercial",
      expectedImpact: averageExpansion >= 60 ? "Alto" : "Médio",
      status: averageExpansion >= 60 ? "Verde" : "Amarelo",
    },
    {
      area: "Eficiência Operacional",
      explanation:
        permissionFeedbacks > 0
          ? "redução de retrabalho em permissões e acessos"
          : "ganho operacional com ações recomendadas",
      expectedImpact: permissionFeedbacks > 0 ? "Médio" : "Baixo",
      status: permissionFeedbacks > 0 ? "Amarelo" : "Verde",
    },
  ];
};

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
      reason: priorityAccount
        ? `Maior risco consolidado do ecossistema: Índice de Risco ${priorityAccount.riskScore}, nível ${priorityAccount.riskLevel}.`
        : "Sem conta crítica consolidada nas fontes atuais.",
      source: "07_IOI_Scores",
      status: isCritical ? "Vermelho" : "Amarelo",
      suggestedAction: priorityAccount?.suggestedAction,
      suggestedDeadline: isCritical ? "7 dias" : "14 dias",
      title: priorityAccount
        ? `Mitigar ${priorityAccount.accountName}`
        : "Mitigar conta mais crítica",
    },
    {
      impact: "Redução de atrito operacional",
      reason: topInitiative
        ? `Principal iniciativa estratégica com pontuação ${topInitiative.score}.`
        : "Iniciativa estratégica ainda não consolidada.",
      status: "Amarelo",
      suggestedDeadline: "30 dias",
      title: topInitiative?.initiative || "Priorizar iniciativa estratégica",
    },
    {
      impact: "Crescimento",
      reason: topOpportunity
        ? `Maior Potencial de Expansão: ${opportunityScore(
            topOpportunity.healthScore,
            topOpportunity.riskScore,
          )}.`
        : "Sem oportunidade consolidada nas fontes atuais.",
      status: "Verde",
      suggestedDeadline: "30 dias",
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
    onboardings.filter((onboarding) => normalize(onboarding.risk).includes("alto")).length;
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
            ? "Conecta risco, onboarding e sinais operacionais."
            : feedbackBonus > 0
              ? "Reduz fricção operacional ligada a feedbacks e acessos."
              : "Conecta recomendações estratégicas, risco e potencial de expansão.",
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
        detail: "Contas com Índice de Saúde disponível",
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

  const topOpportunity = topOpportunities[0];

  const executivePulse = useMemo(
    () => buildExecutivePulse(risks, onboardings, feedbacks),
    [feedbacks, onboardings, risks],
  );

  const trendSignals = useMemo(
    () => buildTrendSignals(risks, onboardings, feedbacks),
    [feedbacks, onboardings, risks],
  );

  const impactSemaphores = useMemo(
    () => buildImpactSemaphores(risks, onboardings, feedbacks),
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

      <QuestionBlock eyebrow="Leitura em poucos segundos" title="Resumo Executivo">
        <ExecutiveSummaryStrip
          initiative={initiativeRanking[0]}
          priorityAccount={priorityAccount}
          topOpportunity={topOpportunity}
        />
      </QuestionBlock>

      <QuestionBlock eyebrow="O que devo fazer?" title="Plano Executivo">
        <ExecutivePlanGrid actions={executivePlan} />
      </QuestionBlock>

      <QuestionBlock
        eyebrow="O que acontece se eu não agir?"
        title="Consequência de Não Agir"
      >
        <p className="text-sm leading-6 text-zinc-600">{noActionConsequence}</p>
        {priorityAccount?.suggestedAction ? (
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            A conta afetada é {priorityAccount.accountName}. A ação recomendada
            reduz a chance de atraso na geração de valor, fricção operacional e
            impacto em adoção ou retenção.
          </p>
        ) : null}
      </QuestionBlock>

      <QuestionBlock eyebrow="Inteligência de Decisão" title="Impacto Esperado">
        <ImpactSemaphoreGrid items={impactSemaphores} />
      </QuestionBlock>

      <QuestionBlock
        eyebrow="O que priorizar nos próximos 90 dias?"
        title="Ranking de Iniciativas"
      >
        <InitiativeRankingList initiatives={initiativeRanking} />
      </QuestionBlock>

      <QuestionBlock
        eyebrow="Onde crescer?"
        title="Principais Oportunidades de Expansão"
      >
        <ExpansionOpportunityList opportunities={topOpportunities} />
      </QuestionBlock>

      <QuestionBlock eyebrow="O que mudou?" title="Tendências Identificadas">
        <TrendList trends={trendSignals} />
        <p className="mt-4 text-xs leading-5 text-zinc-500">
          Leitura baseada no recorte atual das fontes. Onde não há histórico
          temporal suficiente, a variação é tratada como sinal de tendência para
          demonstração.
        </p>
      </QuestionBlock>

      <QuestionBlock
        eyebrow="Como está a saúde geral?"
        title="Pulso Executivo"
      >
        <ExecutivePulseGrid items={executivePulse} />
      </QuestionBlock>

      <KPIGrid isLoading={isLoading} metrics={metrics} />

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

function StatusDot({ status }: { status: TrafficStatus }) {
  const statusClass = {
    Amarelo: "bg-amber-400 shadow-amber-200",
    Verde: "bg-emerald-500 shadow-emerald-200",
    Vermelho: "bg-red-500 shadow-red-200",
  }[status];

  return (
    <span
      className={cn("size-3 rounded-full shadow-[0_0_0_4px]", statusClass)}
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
      {status}
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

function ExecutiveSummaryStrip({
  initiative,
  priorityAccount,
  topOpportunity,
}: {
  initiative: InitiativeRanking | undefined;
  priorityAccount: RiskRow | undefined;
  topOpportunity: RiskRow | undefined;
}) {
  const items = [
    {
      label: "Atenção imediata",
      value: priorityAccount
        ? `${priorityAccount.accountName} em risco ${priorityAccount.riskLevel.toLowerCase()}.`
        : "Sem conta crítica consolidada.",
    },
    {
      label: "Oportunidade",
      value: topOpportunity
        ? `${topOpportunity.accountName} pronto para expansão.`
        : "Sem oportunidade consolidada.",
    },
    {
      label: "Melhor iniciativa",
      value: initiative?.initiative ?? "Sem iniciativa priorizada.",
    },
    {
      label: "Impacto esperado",
      value: "Aumento de adoção e retenção.",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((item) => (
        <article
          className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
          key={item.label}
        >
          <p className="text-xs font-medium text-zinc-500">{item.label}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-zinc-950">
            {item.value}
          </p>
        </article>
      ))}
    </div>
  );
}

function ExecutivePlanGrid({ actions }: { actions: ExecutivePlanAction[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {actions.map((action, index) => (
        <article
          className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
          key={`${action.status}-${action.title}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-2xl font-semibold text-zinc-950">
              {index + 1}
            </span>
            <StatusPill status={action.status} />
          </div>
          <p className="mt-4 text-base font-semibold text-zinc-950">
            {action.title}
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Motivo: {action.reason}
          </p>
          {action.suggestedAction ? (
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Ação sugerida: {action.suggestedAction}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Impacto: {action.impact}</Badge>
            <Badge>Prazo sugerido: {action.suggestedDeadline}</Badge>
            {action.source ? <Badge>Fonte: {action.source}</Badge> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function ExecutivePulseGrid({ items }: { items: ExecutivePulseItem[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {items.map((item) => (
        <article
          className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
          key={item.area}
        >
          <div className="flex items-center justify-between gap-2">
            <StatusDot status={item.status} />
            <span className="text-lg font-semibold text-zinc-950">
              {item.trend}
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-950">
            {item.area}
          </p>
          <div className="mt-2">
            <StatusPill status={item.status} />
          </div>
          <p className="mt-3 text-sm font-medium leading-5 text-zinc-700">
            {item.metric}
          </p>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            {item.reason}
          </p>
        </article>
      ))}
    </div>
  );
}

function ImpactSemaphoreGrid({ items }: { items: ImpactSemaphore[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((item) => (
        <article
          className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
          key={item.area}
        >
          <div className="flex items-center justify-between gap-2">
            <StatusPill status={item.status} />
            <StatusDot status={item.status} />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-950">
            {item.area}
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Impacto esperado: {item.expectedImpact}
          </p>
          <p className="text-xs leading-5 text-zinc-500">{item.explanation}</p>
        </article>
      ))}
    </div>
  );
}

function InitiativeRankingList({
  initiatives,
}: {
  initiatives: InitiativeRanking[];
}) {
  if (initiatives.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
      <p className="text-sm font-medium text-zinc-500">
        O que priorizar nos próximos 90 dias?
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-zinc-950">
        Ranking de Iniciativas
      </h3>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {initiatives.map((initiative) => (
          <article
            className="rounded-lg border border-zinc-200 bg-white p-4"
            key={initiative.initiative}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl font-semibold text-zinc-950">
                {initiative.position}º
              </span>
              <Badge>Pontuação {initiative.score}</Badge>
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-950">
              {initiative.initiative}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Impacto esperado: {initiative.expectedImpact}
            </p>
            <p className="text-sm leading-6 text-zinc-600">
              Prioridade: {initiative.priority}
            </p>
            <p className="text-sm leading-6 text-zinc-600">
              Área responsável: {initiative.area}
            </p>
            <p className="mt-3 text-xs leading-5 text-zinc-500">
              {initiative.justification}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ExpansionOpportunityList({
  opportunities,
}: {
  opportunities: RiskRow[];
}) {
  if (opportunities.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {opportunities.map((opportunity) => (
        <article
          className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
          key={opportunity.accountId}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-950">
              {opportunity.accountName}
            </p>
            <Badge>
              Potencial{" "}
              {opportunityScore(
                opportunity.healthScore,
                opportunity.riskScore,
              )}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Motivo: Índice de Saúde alto combinado ao risco atual.
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Próxima ação:{" "}
            {opportunity.suggestedAction ||
              "avaliar expansão comercial com base no contexto da conta."}
          </p>
        </article>
      ))}
    </div>
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
