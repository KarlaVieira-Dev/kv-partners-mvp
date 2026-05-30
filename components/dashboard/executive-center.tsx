"use client";

import { Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  ecosystemModules,
  intelligenceSignals,
} from "@/data/executive-center";
import type {
  ExecutiveAccountRow,
  ExecutiveAccountsResponse,
} from "@/lib/google-sheets/types";
import { cn } from "@/lib/utils";
import {
  DataTable,
  FilterBar,
  IntelligentSummary,
  KPIGrid,
  Pagination,
  usePaginatedRows,
} from "./shared";

const riskColor = (score: number) => {
  if (score >= 70) {
    return "bg-rose-50 text-rose-700";
  }

  if (score >= 50) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
};

const healthColor = (score: number) => {
  if (score >= 85) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (score >= 70) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-rose-50 text-rose-700";
};

const average = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  );
};

const uniqueOptions = (values: string[]) => [
  "Todos",
  ...Array.from(new Set(values.filter(Boolean))).sort(),
];

export function ExecutiveCenter() {
  const [accounts, setAccounts] = useState<ExecutiveAccountRow[]>([]);
  const [modules, setModules] = useState(ecosystemModules);
  const [source, setSource] =
    useState<ExecutiveAccountsResponse["source"]>("not-configured");
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("Todos");

  useEffect(() => {
    async function loadExecutiveAccounts() {
      try {
        const response = await fetch("/api/accounts");
        const data = (await response.json()) as ExecutiveAccountsResponse;

        setAccounts(data.accounts);
        setModules(data.modules);
        setSource(data.source);
      } finally {
        setIsLoading(false);
      }
    }

    loadExecutiveAccounts();
  }, []);

  const metrics = useMemo(() => {
    const highRiskAccounts = accounts.filter(
      (account) => account.riskScore >= 70,
    );
    const priorityRecommendations = accounts.filter(
      (account) => account.suggestedAction,
    );

    return [
      {
        label: "Índice de Saúde (Health Score) Médio",
        value: average(accounts.map((account) => account.healthScore)),
        trend: `${accounts.length} contas`,
        detail: "Media calculada a partir das contas vindas do Google Sheets",
      },
      {
        label: "Índice de Risco (Risk Score) Médio",
        value: average(accounts.map((account) => account.riskScore)),
        trend: "Risk model",
        detail: "Risco operacional consolidado por conta monitorada",
      },
      {
        label: "Contas em Risco",
        value: highRiskAccounts.length,
        trend: "Risk 70+",
        detail: "Contas com maior chance de friccao operacional",
      },
      {
        label: "Recomendações Prioritárias",
        value: priorityRecommendations.length,
        trend: "Acoes",
        detail: "Acoes sugeridas para onboarding, identidade e crescimento",
      },
    ];
  }, [accounts]);

  const prioritizedAccounts = useMemo(
    () =>
      [...accounts].sort((first, second) => {
        if (second.riskScore !== first.riskScore) {
          return second.riskScore - first.riskScore;
        }

        return first.healthScore - second.healthScore;
      }),
    [accounts],
  );

  const statusOptions = useMemo(
    () => uniqueOptions(accounts.map((account) => account.status)),
    [accounts],
  );
  const filteredAccounts = useMemo(
    () =>
      prioritizedAccounts.filter(
        (account) => status === "Todos" || account.status === status,
      ),
    [prioritizedAccounts, status],
  );
  const { page, paginatedRows, setPage } =
    usePaginatedRows(filteredAccounts);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Ecossistema de Inteligência de Produto
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Centro Executivo
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Uma camada executiva para consolidar onboarding, feedbacks,
              identidade, riscos operacionais e oportunidades de crescimento.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <Sparkles className="size-4 text-zinc-950" />
            {source === "google-sheets" ? "Google Sheets ativo" : "Planilha pronta"}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {modules.map((module) => (
            <span
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600"
              key={module}
            >
              {module}
            </span>
          ))}
        </div>
      </section>

      <KPIGrid isLoading={isLoading} metrics={metrics} />

      <FilterBar>
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
          <Search className="size-4 text-zinc-400" />
          <span className="px-3 text-sm text-zinc-500">
            Contas priorizadas por risco e saúde
          </span>
        </div>
        <div className="lg:w-[220px]">
          <FilterSelect
            label="Status"
            onChange={setStatus}
            options={statusOptions}
            value={status}
          />
        </div>
      </FilterBar>

      <DataTable
        columns={[
          {
            className: "font-medium text-zinc-950",
            header: "Conta",
            render: (account) => account.account,
          },
          { header: "Tipo", render: (account) => account.type },
          { header: "Status", render: (account) => account.status },
          {
            header: "Índice de Saúde (Health Score)",
            render: (account) => (
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  healthColor(account.healthScore),
                )}
              >
                {account.healthScore}
              </span>
            ),
          },
          {
            header: "Índice de Risco (Risk Score)",
            render: (account) => (
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  riskColor(account.riskScore),
                )}
              >
                {account.riskScore}
              </span>
            ),
          },
          {
            className: "max-w-[240px] leading-6",
            header: "Motivo principal",
            render: (account) => account.mainReason,
          },
          {
            className: "max-w-[240px] leading-6",
            header: "Acao sugerida",
            render: (account) => account.suggestedAction,
          },
        ]}
        emptyMessage="Nenhuma conta prioritaria corresponde aos filtros selecionados."
        getRowKey={(account) => account.account}
        isLoading={isLoading}
        rows={paginatedRows}
        title="Contas Prioritárias"
      />

      <Pagination
        currentPage={page}
        onPageChange={setPage}
        totalItems={filteredAccounts.length}
      />

      <IntelligentSummary
        items={intelligenceSignals}
        meta={[
          {
            label: "Origem dos dados",
            value: source === "google-sheets" ? "Google Sheets" : "Planilha pendente",
          },
          { label: "Contas lidas", value: accounts.length },
          { label: "Contas filtradas", value: filteredAccounts.length },
        ]}
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
