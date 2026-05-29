"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
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

export function ExecutiveCenter() {
  const [accounts, setAccounts] = useState<ExecutiveAccountRow[]>([]);
  const [modules, setModules] = useState(ecosystemModules);
  const [source, setSource] =
    useState<ExecutiveAccountsResponse["source"]>("not-configured");
  const [isLoading, setIsLoading] = useState(true);

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
        label: "Health Score Medio",
        value: average(accounts.map((account) => account.healthScore)),
        trend: `${accounts.length} contas`,
        detail: "Media calculada a partir das contas vindas do Google Sheets",
      },
      {
        label: "Risk Score Medio",
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
        label: "Recomendacoes Prioritarias",
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

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Product Intelligence Ecosystem
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Executive Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Uma camada executiva para consolidar onboarding, feedbacks,
              identidade, riscos operacionais e oportunidades de crescimento.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <Sparkles className="size-4 text-zinc-950" />
            {source === "google-sheets" ? "Google Sheets active" : "Sheet ready"}
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            key={metric.label}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-zinc-500">
                {metric.label}
              </p>
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                {metric.trend}
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
              {isLoading ? "..." : metric.value}
            </p>
            <p className="mt-2 text-sm text-zinc-500">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-base font-semibold text-zinc-950">
              Contas Prioritarias
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                  <th className="px-5 py-3">Conta</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Health</th>
                  <th className="px-5 py-3">Risk</th>
                  <th className="px-5 py-3">Motivo principal</th>
                  <th className="px-5 py-3">Acao sugerida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {prioritizedAccounts.map((account) => (
                  <tr
                    className="align-top text-sm text-zinc-600"
                    key={account.account}
                  >
                    <td className="px-5 py-4 font-medium text-zinc-950">
                      {account.account}
                    </td>
                    <td className="px-5 py-4">{account.type}</td>
                    <td className="px-5 py-4">{account.status}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-md px-2 py-1 text-xs font-medium",
                          healthColor(account.healthScore),
                        )}
                      >
                        {account.healthScore}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-md px-2 py-1 text-xs font-medium",
                          riskColor(account.riskScore),
                        )}
                      >
                        {account.riskScore}
                      </span>
                    </td>
                    <td className="max-w-[240px] px-5 py-4 leading-6">
                      {account.mainReason}
                    </td>
                    <td className="max-w-[240px] px-5 py-4 leading-6">
                      {account.suggestedAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Resumo Inteligente</h2>
            <ArrowUpRight className="size-4 text-zinc-400" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
              <p className="text-xs text-zinc-400">Origem dos dados</p>
              <p className="mt-1 text-sm font-semibold">
                {source === "google-sheets" ? "Google Sheets" : "Sheet pending"}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
              <p className="text-xs text-zinc-400">Contas lidas</p>
              <p className="mt-1 text-2xl font-semibold">{accounts.length}</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {intelligenceSignals.map((signal) => (
              <p
                className="rounded-lg border border-white/10 bg-white/[0.06] p-3 text-sm leading-6 text-zinc-200"
                key={signal}
              >
                {signal}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
