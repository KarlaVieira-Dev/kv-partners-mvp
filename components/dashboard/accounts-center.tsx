"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

const scoreColor = (score: number) => {
  if (score >= 85) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (score >= 70) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-rose-50 text-rose-700";
};

const riskColor = (score: number) => {
  if (score >= 70) {
    return "bg-rose-50 text-rose-700";
  }

  if (score >= 50) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
};

const opportunityScore = (healthScore: number, riskScore: number) =>
  Math.round(healthScore - riskScore * 0.5);

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

const isManagerAccount = (type: string) =>
  type.toLowerCase().includes("gestora");

const isManagedAccount = (type: string) =>
  type.toLowerCase().includes("gerenciada");

export function AccountsCenter() {
  const [accounts, setAccounts] = useState<ExecutiveAccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("Todos");
  const [segment, setSegment] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [sortByOpportunity, setSortByOpportunity] = useState(true);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const response = await fetch("/api/accounts");
        const data = (await response.json()) as ExecutiveAccountsResponse;

        setAccounts(data.accounts);
      } finally {
        setIsLoading(false);
      }
    }

    loadAccounts();
  }, []);

  const filterOptions = useMemo(
    () => ({
      segments: uniqueOptions(
        accounts.map((account) => account.segment ?? ""),
      ),
      statuses: uniqueOptions(accounts.map((account) => account.status)),
      types: uniqueOptions(accounts.map((account) => account.type)),
    }),
    [accounts],
  );

  const filteredAccounts = useMemo(() => {
    const filtered = accounts.filter((account) => {
      const matchesSearch = account.account
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesType = type === "Todos" || account.type === type;
      const matchesSegment =
        segment === "Todos" || account.segment === segment;
      const matchesStatus = status === "Todos" || account.status === status;

      return matchesSearch && matchesType && matchesSegment && matchesStatus;
    });

    if (!sortByOpportunity) {
      return filtered;
    }

    return [...filtered].sort(
      (first, second) =>
        opportunityScore(second.healthScore, second.riskScore) -
        opportunityScore(first.healthScore, first.riskScore),
    );
  }, [accounts, search, segment, sortByOpportunity, status, type]);

  const metrics = useMemo(
    () => [
      {
        detail: "Base lida da aba 01_Contas",
        label: "Total de contas",
        value: accounts.length,
      },
      {
        detail: "Tipo de conta gestora",
        label: "Contas Gestoras",
        value: accounts.filter((account) => isManagerAccount(account.type))
          .length,
      },
      {
        detail: "Tipo de conta gerenciada",
        label: "Contas Gerenciadas",
        value: accounts.filter((account) => isManagedAccount(account.type))
          .length,
      },
      {
        detail: "Média do health_score",
        label: "Índice de Saúde (Health Score) médio",
        value: average(accounts.map((account) => account.healthScore)),
      },
    ],
    [accounts],
  );

  const { page, paginatedRows, setPage } = usePaginatedRows(filteredAccounts);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Inteligencia de Contas
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Contas
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Monitore a saúde do portfólio, o contexto comercial e o status do
              ciclo de vida das contas no ecossistema.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <SlidersHorizontal className="size-4 text-zinc-950" />
            {isLoading ? "Carregando contas" : `${filteredAccounts.length} contas`}
          </div>
        </div>
      </section>

      <KPIGrid isLoading={isLoading} metrics={metrics} />

      <FilterBar>
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
            <Search className="size-4 text-zinc-400" />
            <input
              aria-label="Filtrar contas por nome"
              className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar contas..."
              type="search"
              value={search}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
            <FilterSelect
              label="Tipo"
              onChange={setType}
              options={filterOptions.types}
              value={type}
            />
            <FilterSelect
              label="Segmento"
              onChange={setSegment}
              options={filterOptions.segments}
              value={segment}
            />
            <FilterSelect
              label="Status"
              onChange={setStatus}
              options={filterOptions.statuses}
              value={status}
            />
          </div>
          <button
            className={cn(
              "h-10 rounded-lg border px-3 text-sm font-medium transition",
              sortByOpportunity
                ? "border-zinc-950 bg-zinc-950 text-white"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100",
            )}
            onClick={() => setSortByOpportunity((current) => !current)}
            type="button"
          >
            Opportunity Score ↓
          </button>
      </FilterBar>

      <DataTable
        columns={[
          {
            className: "font-medium text-zinc-950",
            header: "Conta",
            render: (account) => account.account,
          },
          { header: "Tipo", render: (account) => account.type },
          { header: "Segmento", render: (account) => account.segment },
          { header: "Porte", render: (account) => account.size },
          { header: "Status", render: (account) => account.status },
          {
            header: "Índice de Saúde (Health Score)",
            render: (account) => (
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  scoreColor(account.healthScore),
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
            header: "Opportunity Score",
            render: (account) => (
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                {opportunityScore(account.healthScore, account.riskScore)}
              </span>
            ),
          },
          { header: "Plano", render: (account) => account.plan },
          { header: "Cidade", render: (account) => account.city },
          { header: "Estado", render: (account) => account.state },
        ]}
        emptyMessage="Nenhuma conta corresponde aos filtros selecionados."
        getRowKey={(account) => account.account}
        isLoading={isLoading}
        minWidth="1240px"
        rows={paginatedRows}
        title="Contas"
      />

      <Pagination
        currentPage={page}
        onPageChange={setPage}
        totalItems={filteredAccounts.length}
      />

      <IntelligentSummary
        items={[
          "Contas gestoras concentram a visão executiva do ecossistema.",
          "Contas com Índice de Saúde (Health Score) mais baixo devem ser acompanhadas junto ao Centro de Riscos.",
          "Segmento, plano e localização ajudam a priorizar a estratégia de relacionamento.",
        ]}
        meta={[
          { label: "Contas filtradas", value: filteredAccounts.length },
          { label: "Base total", value: accounts.length },
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
