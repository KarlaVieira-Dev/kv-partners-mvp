"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import type {
  ExecutiveAccountRow,
  ExecutiveAccountsResponse,
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

export function ExecutiveCenter() {
  const [accounts, setAccounts] = useState<ExecutiveAccountRow[]>([]);
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
          risksResponse,
          onboardingsResponse,
          growthResponse,
        ] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/risks"),
          fetch("/api/onboardings"),
          fetch("/api/growth"),
        ]);

        const accountsData =
          (await accountsResponse.json()) as ExecutiveAccountsResponse;
        const risksData = (await risksResponse.json()) as RisksResponse;
        const onboardingsData =
          (await onboardingsResponse.json()) as OnboardingsResponse;
        const growthData = (await growthResponse.json()) as GrowthResponse;

        setAccounts(accountsData.accounts);
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

  const topOpportunity = useMemo(() => {
    const recommendation = [...growth.recommendations].sort(
      (first, second) => second.opportunityScore - first.opportunityScore,
    )[0];
    const account = [...accounts]
      .filter((item) => item.healthScore >= 80)
      .sort((first, second) => second.healthScore - first.healthScore)[0];
    const insight = growth.insights.find((item) => isPriority(item.impact));

    return {
      account,
      insight,
      recommendation,
    };
  }, [accounts, growth.insights, growth.recommendations]);

  const trendSignal = useMemo(() => {
    const critical = risks.filter((risk) =>
      normalize(risk.riskLevel).includes("critico"),
    ).length;
    const high = risks.filter((risk) =>
      normalize(risk.riskLevel).includes("alto"),
    ).length;

    return {
      critical,
      high,
      label:
        critical > 0
          ? "Pressão concentrada em risco crítico"
          : "Pressão concentrada em risco alto",
    };
  }, [risks]);

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
          title="Sinal de tendência"
        >
          <p className="text-sm leading-6 text-zinc-600">
            {trendSignal.label}. Esta leitura usa o recorte atual das fontes e
            deve ser interpretada como variação simulada para demonstração, não
            como histórico real.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniMetric label="Crítico" value={trendSignal.critical} />
            <MiniMetric label="Alto" value={trendSignal.high} />
          </div>
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
          eyebrow="4. Qual oportunidade gera mais valor?"
          title={
            topOpportunity.account?.account ??
            topOpportunity.recommendation?.recommendation ??
            "Sem oportunidade consolidada"
          }
        >
          <div className="space-y-3 text-sm leading-6 text-zinc-600">
            {topOpportunity.account ? (
              <p>
                Conta com Health Score {topOpportunity.account.healthScore} e
                status {topOpportunity.account.status}.
              </p>
            ) : null}
            {topOpportunity.recommendation ? (
              <p>{topOpportunity.recommendation.recommendation}</p>
            ) : null}
            {topOpportunity.insight ? <p>{topOpportunity.insight.insight}</p> : null}
            {!topOpportunity.account &&
            !topOpportunity.recommendation &&
            !topOpportunity.insight ? (
              <EmptyState />
            ) : null}
          </div>
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

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-950">{value}</p>
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
