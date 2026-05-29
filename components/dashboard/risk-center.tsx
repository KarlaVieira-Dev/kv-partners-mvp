"use client";

import { AlertTriangle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { RiskRow, RisksResponse } from "@/lib/google-sheets/types";
import { cn } from "@/lib/utils";

const uniqueOptions = (values: string[]) => [
  "All",
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

const riskColor = (level: string) => {
  const normalizedLevel = level.toLowerCase();

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
  const [healthLevel, setHealthLevel] = useState("All");
  const [riskLevel, setRiskLevel] = useState("All");
  const [type, setType] = useState("All");

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
      const matchesRisk = riskLevel === "All" || risk.riskLevel === riskLevel;
      const matchesHealth =
        healthLevel === "All" || risk.healthLevel === healthLevel;
      const matchesType = type === "All" || risk.accountType === type;

      return matchesRisk && matchesHealth && matchesType;
    });
  }, [healthLevel, riskLevel, risks, type]);

  const priorityAccount = useMemo(
    () =>
      [...risks].sort((first, second) => second.riskScore - first.riskScore)[0],
    [risks],
  );

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
        label: "Risk Score medio",
        value: average(risks.map((risk) => risk.riskScore)),
      },
      {
        detail: "Media de health_score",
        label: "Health Score medio",
        value: average(risks.map((risk) => risk.healthScore)),
      },
      {
        detail: "Nivel alto ou critico",
        label: "Contas em risco alto/critico",
        value: highRisk.length,
      },
      {
        detail: "Nivel de saude positivo",
        label: "Contas saudaveis",
        value: healthyAccounts.length,
      },
      {
        detail: "Acoes sugeridas registradas",
        label: "Acoes sugeridas",
        value: risks.filter((risk) => risk.suggestedAction).length,
      },
    ];
  }, [risks]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Identity & Onboarding Intelligence
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Risk Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Monitor risk, health, access, usage, onboarding and feedback
              signals across accounts.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <AlertTriangle className="size-4 text-zinc-950" />
            {isLoading ? "Loading risks" : `${filteredRisks.length} accounts`}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <article
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            key={metric.label}
          >
            <p className="text-sm font-medium text-zinc-500">
              {metric.label}
            </p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
              {isLoading ? "..." : metric.value}
            </p>
            <p className="mt-2 text-sm text-zinc-500">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Conta prioritaria
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">
            {priorityAccount?.accountName ?? "Nenhuma conta"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {priorityAccount?.mainReason ?? "Sem dados de risco carregados."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
              Risk {priorityAccount?.riskScore ?? 0}
            </span>
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
              {priorityAccount?.riskLevel ?? "Sem nivel"}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Distribuicao de risco
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

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
            <Search className="size-4 text-zinc-400" />
            <span className="px-3 text-sm text-zinc-500">Tabela de riscos</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[540px]">
            <FilterSelect
              label="Risk level"
              onChange={setRiskLevel}
              options={filterOptions.riskLevels}
              value={riskLevel}
            />
            <FilterSelect
              label="Health level"
              onChange={setHealthLevel}
              options={filterOptions.healthLevels}
              value={healthLevel}
            />
            <FilterSelect
              label="Type"
              onChange={setType}
              options={filterOptions.types}
              value={type}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                <th className="px-5 py-3">Conta</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Risk Score</th>
                <th className="px-5 py-3">Health Score</th>
                <th className="px-5 py-3">Nivel de Risco</th>
                <th className="px-5 py-3">Nivel de Saude</th>
                <th className="px-5 py-3">Motivo Principal</th>
                <th className="px-5 py-3">Acao Sugerida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredRisks.map((risk) => (
                <tr className="align-top text-sm text-zinc-600" key={risk.accountId}>
                  <td className="px-5 py-4 font-medium text-zinc-950">
                    {risk.accountName}
                  </td>
                  <td className="px-5 py-4">{risk.accountType}</td>
                  <td className="px-5 py-4">{risk.accountStatus}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                      {risk.riskScore}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium",
                        scoreColor(risk.healthScore),
                      )}
                    >
                      {risk.healthScore}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium",
                        riskColor(risk.riskLevel),
                      )}
                    >
                      {risk.riskLevel}
                    </span>
                  </td>
                  <td className="px-5 py-4">{risk.healthLevel}</td>
                  <td className="max-w-[240px] px-5 py-4 leading-6">
                    {risk.mainReason}
                  </td>
                  <td className="max-w-[240px] px-5 py-4 leading-6">
                    {risk.suggestedAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredRisks.length === 0 && (
          <div className="border-t border-zinc-100 px-5 py-10 text-center text-sm text-zinc-500">
            No risk records match the selected filters.
          </div>
        )}
      </section>
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
