"use client";

import { AlertTriangle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { RiskRow, RisksResponse } from "@/lib/google-sheets/types";
import { cn } from "@/lib/utils";
import {
  DataTable,
  FilterBar,
  IntelligentSummary,
  KPIGrid,
  Pagination,
  usePaginatedRows,
} from "./shared";

const uniqueOptions = (values: string[]) => [
  "Todos",
  ...Array.from(new Set(values.filter(Boolean))).sort(),
];

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

const riskColor = (level: string) => {
  const normalizedLevel = normalize(level);

  if (normalizedLevel.includes("crit")) {
    return "bg-red-50 text-red-700";
  }

  if (normalizedLevel.includes("alto")) {
    return "bg-rose-50 text-rose-700";
  }

  if (normalizedLevel.includes("medio") || normalizedLevel.includes("médio")) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
};

const scoreColor = (score: number) => {
  if (score >= 80) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (score >= 60) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-rose-50 text-rose-700";
};

export function RiskCenter() {
  const [risks, setRisks] = useState<RiskRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [healthLevel, setHealthLevel] = useState("Todos");
  const [riskLevel, setRiskLevel] = useState("Todos");
  const [type, setType] = useState("Todos");

  useEffect(() => {
    async function loadRisks() {
      try {
        const response = await fetch("/api/risks");
        const data = (await response.json()) as RisksResponse;

        setRisks(data.risks);
      } finally {
        setIsLoading(false);
      }
    }

    loadRisks();
  }, []);

  const filterOptions = useMemo(
    () => ({
      healthLevels: uniqueOptions(risks.map((risk) => risk.healthLevel)),
      riskLevels: uniqueOptions(risks.map((risk) => risk.riskLevel)),
      types: uniqueOptions(risks.map((risk) => risk.accountType)),
    }),
    [risks],
  );

  const filteredRisks = useMemo(() => {
    return risks.filter((risk) => {
      const matchesRisk = riskLevel === "Todos" || risk.riskLevel === riskLevel;
      const matchesHealth =
        healthLevel === "Todos" || risk.healthLevel === healthLevel;
      const matchesType = type === "Todos" || risk.accountType === type;

      return matchesRisk && matchesHealth && matchesType;
    });
  }, [healthLevel, riskLevel, risks, type]);

  const priorityAccount = useMemo(
    () =>
      [...risks].sort((first, second) => second.riskScore - first.riskScore)[0],
    [risks],
  );

  const riskVectors = useMemo(() => {
    const vectors = [
      { label: "Onboarding", getScore: (risk: RiskRow) => risk.onboardingScore },
      { label: "Adoção", getScore: (risk: RiskRow) => risk.usageScore },
      { label: "Acessos", getScore: (risk: RiskRow) => risk.accessScore },
      { label: "Feedback", getScore: (risk: RiskRow) => risk.feedbackScore },
    ];

    return vectors
      .map((vector) => {
        const exposedAccounts = risks.filter((risk) => vector.getScore(risk) < 70);
        const severity = average(
          risks.map((risk) => Math.max(0, 100 - vector.getScore(risk))),
        );

        return {
          impact:
            severity >= 45 || exposedAccounts.length >= 3
              ? "Alto"
              : severity >= 25 || exposedAccounts.length >= 1
                ? "Médio"
                : "Baixo",
          label: vector.label,
          severity,
          volume: exposedAccounts.length,
        };
      })
      .sort(
        (first, second) =>
          second.volume - first.volume || second.severity - first.severity,
      );
  }, [risks]);

  const riskDistribution = useMemo(() => {
    const levels = ["Baixo", "Medio", "Alto", "Critico"];

    return levels.map((level) => ({
      label: level,
      value: risks.filter((risk) =>
        risk.riskLevel
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .includes(level.toLowerCase()),
      ).length,
    }));
  }, [risks]);

  const metrics = useMemo(() => {
    const highRisk = risks.filter((risk) => {
      const normalized = risk.riskLevel
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      return normalized.includes("alto") || normalized.includes("critico");
    });
    const healthyAccounts = risks.filter((risk) => {
      const normalized = risk.healthLevel
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      return normalized.includes("excelente") || normalized.includes("boa");
    });

    return [
      {
        detail: "Media de risk_score",
        label: "Índice de Risco (Risk Score) médio",
        value: average(risks.map((risk) => risk.riskScore)),
      },
      {
        detail: "Media de health_score",
        label: "Índice de Saúde (Health Score) médio",
        value: average(risks.map((risk) => risk.healthScore)),
      },
      {
        detail: "Nivel alto ou critico",
        label: "Contas em risco alto/crítico",
        value: highRisk.length,
      },
      {
        detail: "Nivel de saude positivo",
        label: "Contas saudáveis",
        value: healthyAccounts.length,
      },
      {
        detail: "Ações sugeridas registradas",
        label: "Ações sugeridas",
        value: risks.filter((risk) => risk.suggestedAction).length,
      },
    ];
  }, [risks]);

  const { page, paginatedRows, setPage } = usePaginatedRows(filteredRisks);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              IOI | Inteligência especializada de risco
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Quem está em risco agora?
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              A leitura do IOI responde quem exige atenção, por que está em
              risco e o que pode acontecer se não atuarmos.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <AlertTriangle className="size-4 text-zinc-950" />
            {isLoading ? "Carregando riscos" : `${filteredRisks.length} contas`}
          </div>
        </div>
      </section>

      <KPIGrid isLoading={isLoading} metrics={metrics} />

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-zinc-500">
          Qual vetor gera mais risco?
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
          Principais Vetores de Risco
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {riskVectors.map((vector, index) => (
            <article
              className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
              key={vector.label}
            >
              <p className="text-xs font-medium text-zinc-500">
                {index + 1}. {vector.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">
                {vector.volume}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                contas abaixo de 70 no vetor
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                  Severidade {vector.severity}
                </span>
                <span
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium",
                    riskColor(vector.impact),
                  )}
                >
                  Impacto {vector.impact}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Quem exige atenção primeiro?
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">
            {priorityAccount?.accountName ?? "Nenhuma conta"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {priorityAccount?.mainReason ?? "Sem dados de risco carregados."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
              Risco {priorityAccount?.riskScore ?? 0}
            </span>
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
              {priorityAccount?.riskLevel ?? "Sem nivel"}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Quem está em risco por nível?
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {riskDistribution.map((item) => (
              <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3" key={item.label}>
                <p className="text-xs text-zinc-500">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-950">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-zinc-500">
          O que acontece se não atuarmos?
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
          Consequência provável
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          {priorityAccount
            ? `Se ${priorityAccount.accountName} permanecer em ${priorityAccount.riskLevel.toLowerCase()}, o motivo principal (${priorityAccount.mainReason.toLowerCase()}) tende a manter a conta exposta a fricção operacional, atraso na adoção e impacto em retenção.`
            : "Sem dados suficientes para gerar narrativa de consequência."}
        </p>
        {priorityAccount?.suggestedAction ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
            Ação recomendada: {priorityAccount.suggestedAction}
          </p>
        ) : null}
      </section>

      <FilterBar>
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
            <Search className="size-4 text-zinc-400" />
            <span className="px-3 text-sm text-zinc-500">
              Por que essas contas exigem atenção?
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[540px]">
            <FilterSelect
              label="Nivel de risco"
              onChange={setRiskLevel}
              options={filterOptions.riskLevels}
              value={riskLevel}
            />
            <FilterSelect
              label="Nivel de saude"
              onChange={setHealthLevel}
              options={filterOptions.healthLevels}
              value={healthLevel}
            />
            <FilterSelect
              label="Tipo"
              onChange={setType}
              options={filterOptions.types}
              value={type}
            />
          </div>
      </FilterBar>

      <DataTable
        columns={[
          {
            className: "font-medium text-zinc-950",
            header: "Conta",
            render: (risk) => risk.accountName,
          },
          { header: "Tipo", render: (risk) => risk.accountType },
          { header: "Status", render: (risk) => risk.accountStatus },
          {
            header: "Índice de Risco (Risk Score)",
            render: (risk) => (
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                {risk.riskScore}
              </span>
            ),
          },
          {
            header: "Índice de Saúde (Health Score)",
            render: (risk) => (
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  scoreColor(risk.healthScore),
                )}
              >
                {risk.healthScore}
              </span>
            ),
          },
          {
            header: "Nível de Risco",
            render: (risk) => (
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  riskColor(risk.riskLevel),
                )}
              >
                {risk.riskLevel}
              </span>
            ),
          },
          { header: "Nível de Saúde", render: (risk) => risk.healthLevel },
          {
            className: "max-w-[240px] leading-6",
            header: "Motivo Principal",
            render: (risk) => risk.mainReason,
          },
          {
            className: "max-w-[240px] leading-6",
            header: "Acao Sugerida",
            render: (risk) => risk.suggestedAction,
          },
        ]}
        emptyMessage="Nenhum registro de risco corresponde aos filtros selecionados."
        getRowKey={(risk) => risk.accountId}
        isLoading={isLoading}
        minWidth="1120px"
        rows={paginatedRows}
        title="Por que essas contas exigem atenção?"
      />

      <Pagination
        currentPage={page}
        onPageChange={setPage}
        totalItems={filteredRisks.length}
      />

      <IntelligentSummary
        items={[
          "Contas em nível Alto ou Crítico exigem atuação antes que o risco avance para retenção, adoção ou valor percebido.",
          "O motivo principal explica por que a conta está em risco sem reinterpretar a fonte 07_IOI_Scores.",
          "A ação recomendada mostra o próximo passo para reduzir exposição operacional.",
        ]}
        meta={[
          { label: "Riscos filtrados", value: filteredRisks.length },
          { label: "Ações sugeridas", value: metrics[4]?.value ?? 0 },
        ]}
        title="O que pode acontecer se não atuarmos?"
      />
    </div>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">
      {label}
      <select
        className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-normal text-zinc-900 outline-none transition focus:border-zinc-400"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
