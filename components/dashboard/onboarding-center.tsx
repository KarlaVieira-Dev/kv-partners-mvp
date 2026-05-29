"use client";

import { CalendarClock, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  OnboardingRow,
  OnboardingsResponse,
} from "@/lib/google-sheets/types";
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

const riskColor: Record<OnboardingRow["risk"], string> = {
  Alto: "bg-rose-50 text-rose-700",
  Baixo: "bg-emerald-50 text-emerald-700",
  Medio: "bg-amber-50 text-amber-700",
};

export function OnboardingCenter() {
  const [onboardings, setOnboardings] = useState<OnboardingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState("All");
  const [risk, setRisk] = useState("All");
  const [status, setStatus] = useState("All");

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
        account === "All" || onboarding.account === account;
      const matchesRisk = risk === "All" || onboarding.risk === risk;
      const matchesStatus =
        status === "All" || onboarding.status === status;

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
        label: "Onboardings Concluidos",
        value: completed.length,
      },
      {
        detail: "Ainda em execucao",
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

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Account Onboarding
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Onboarding Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Monitor onboarding progress, deadlines, risk, and the next action
              required for each account.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <CalendarClock className="size-4 text-zinc-950" />
            {isLoading ? "Loading onboardings" : `${filteredOnboardings.length} records`}
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

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
            <Search className="size-4 text-zinc-400" />
            <select
              aria-label="Filter by account"
              className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-900 outline-none"
              onChange={(event) => setAccount(event.target.value)}
              value={account}
            >
              {filterOptions.accounts.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All accounts" : option}
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
              label="Risk"
              onChange={setRisk}
              options={filterOptions.risks}
              value={risk}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                <th className="px-5 py-3">Conta</th>
                <th className="px-5 py-3">Data Inicio</th>
                <th className="px-5 py-3">Data Prevista Conclusao</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Progresso</th>
                <th className="px-5 py-3">Dias em Andamento</th>
                <th className="px-5 py-3">Risco</th>
                <th className="px-5 py-3">Proxima Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOnboardings.map((onboarding) => (
                <tr className="align-top text-sm text-zinc-600" key={onboarding.id}>
                  <td className="px-5 py-4 font-medium text-zinc-950">
                    {onboarding.account}
                  </td>
                  <td className="px-5 py-4">{onboarding.startDate}</td>
                  <td className="px-5 py-4">
                    {onboarding.expectedConclusionDate}
                  </td>
                  <td className="px-5 py-4">{onboarding.status}</td>
                  <td className="px-5 py-4">
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
                  </td>
                  <td className="px-5 py-4">{onboarding.daysInProgress}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium",
                        riskColor[onboarding.risk],
                      )}
                    >
                      {onboarding.risk}
                    </span>
                  </td>
                  <td className="max-w-[260px] px-5 py-4 leading-6">
                    {onboarding.nextAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredOnboardings.length === 0 && (
          <div className="border-t border-zinc-100 px-5 py-10 text-center text-sm text-zinc-500">
            No onboarding records match the selected filters.
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
