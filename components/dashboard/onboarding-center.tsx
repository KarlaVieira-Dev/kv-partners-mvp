"use client";

import { CalendarClock, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  OnboardingRow,
  OnboardingsResponse,
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

const riskColor: Record<OnboardingRow["risk"], string> = {
  Alto: "bg-rose-50 text-rose-700",
  Baixo: "bg-emerald-50 text-emerald-700",
  Medio: "bg-amber-50 text-amber-700",
};

export function OnboardingCenter() {
  const [onboardings, setOnboardings] = useState<OnboardingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState("Todos");
  const [risk, setRisk] = useState("Todos");
  const [status, setStatus] = useState("Todos");

  useEffect(() => {
    async function loadOnboardings() {
      try {
        const response = await fetch("/api/onboardings");
        const data = (await response.json()) as OnboardingsResponse;

        setOnboardings(data.onboardings);
      } finally {
        setIsLoading(false);
      }
    }

    loadOnboardings();
  }, []);

  const filterOptions = useMemo(
    () => ({
      accounts: uniqueOptions(
        onboardings.map((onboarding) => onboarding.account),
      ),
      risks: uniqueOptions(onboardings.map((onboarding) => onboarding.risk)),
      statuses: uniqueOptions(
        onboardings.map((onboarding) => onboarding.status),
      ),
    }),
    [onboardings],
  );

  const filteredOnboardings = useMemo(() => {
    return onboardings.filter((onboarding) => {
      const matchesAccount =
        account === "Todos" || onboarding.account === account;
      const matchesRisk = risk === "Todos" || onboarding.risk === risk;
      const matchesStatus =
        status === "Todos" || onboarding.status === status;

      return matchesAccount && matchesRisk && matchesStatus;
    });
  }, [account, onboardings, risk, status]);

  const metrics = useMemo(() => {
    const completed = onboardings.filter((onboarding) =>
      onboarding.status.toLowerCase().includes("conclu"),
    );
    const inProgress = onboardings.filter(
      (onboarding) => !onboarding.status.toLowerCase().includes("conclu"),
    );
    const atRisk = onboardings.filter(
      (onboarding) => onboarding.risk === "Alto",
    );

    return [
      {
        detail: "Registros em 04_Onboardings",
        label: "Onboardings Iniciados",
        value: onboardings.length,
      },
      {
        detail: "Status concluido",
        label: "Onboardings Concluídos",
        value: completed.length,
      },
      {
        detail: "Ainda em execução",
        label: "Onboardings em Andamento",
        value: inProgress.length,
      },
      {
        detail: "Risco alto",
        label: "Onboardings em Risco",
        value: atRisk.length,
      },
      {
        detail: "Media de dias",
        label: "Tempo Medio de Onboarding",
        value: average(
          onboardings.map((onboarding) => onboarding.daysInProgress),
        ),
      },
    ];
  }, [onboardings]);

  const { page, paginatedRows, setPage } =
    usePaginatedRows(filteredOnboardings);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Onboarding de Contas
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Centro de Onboarding
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Monitore progresso, prazos, risco e a próxima ação necessária
              para cada conta em onboarding.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <CalendarClock className="size-4 text-zinc-950" />
            {isLoading ? "Carregando onboardings" : `${filteredOnboardings.length} registros`}
          </div>
        </div>
      </section>

      <KPIGrid isLoading={isLoading} metrics={metrics} />

      <FilterBar>
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
            <Search className="size-4 text-zinc-400" />
            <select
              aria-label="Filtrar por conta"
              className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-900 outline-none"
              onChange={(event) => setAccount(event.target.value)}
              value={account}
            >
              {filterOptions.accounts.map((option) => (
                <option key={option} value={option}>
                  {option === "Todos" ? "Todas as contas" : option}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
            <FilterSelect
              label="Status"
              onChange={setStatus}
              options={filterOptions.statuses}
              value={status}
            />
            <FilterSelect
              label="Risco"
              onChange={setRisk}
              options={filterOptions.risks}
              value={risk}
            />
          </div>
      </FilterBar>

      <DataTable
        columns={[
          {
            className: "font-medium text-zinc-950",
            header: "Conta",
            render: (onboarding) => onboarding.account,
          },
          { header: "Data Início", render: (onboarding) => onboarding.startDate },
          {
            header: "Data Prevista de Conclusão",
            render: (onboarding) => onboarding.expectedConclusionDate,
          },
          { header: "Status", render: (onboarding) => onboarding.status },
          {
            header: "Progresso",
            render: (onboarding) => (
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-zinc-950"
                    style={{ width: `${onboarding.progress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-zinc-700">
                  {onboarding.progress}%
                </span>
              </div>
            ),
          },
          {
            header: "Dias em Andamento",
            render: (onboarding) => onboarding.daysInProgress,
          },
          {
            header: "Risco",
            render: (onboarding) => (
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  riskColor[onboarding.risk],
                )}
              >
                {onboarding.risk}
              </span>
            ),
          },
          {
            className: "max-w-[260px] leading-6",
            header: "Próxima Ação",
            render: (onboarding) => onboarding.nextAction,
          },
        ]}
        emptyMessage="Nenhum registro de onboarding corresponde aos filtros selecionados."
        getRowKey={(onboarding) => onboarding.id}
        isLoading={isLoading}
        minWidth="1100px"
        rows={paginatedRows}
        title="Onboardings"
      />

      <Pagination
        currentPage={page}
        onPageChange={setPage}
        totalItems={filteredOnboardings.length}
      />

      <IntelligentSummary
        items={[
          "Onboardings com risco alto devem ser priorizados pelo time operacional.",
          "Progresso e dias em andamento sinalizam contas que podem precisar de intervenção.",
          "A próxima ação ajuda a transformar acompanhamento em execução concreta.",
        ]}
        meta={[
          { label: "Registros filtrados", value: filteredOnboardings.length },
          { label: "Tempo medio", value: metrics[4]?.value ?? 0 },
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
