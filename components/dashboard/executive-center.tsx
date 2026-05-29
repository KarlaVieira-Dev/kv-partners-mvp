import { ArrowUpRight, Sparkles } from "lucide-react";

import {
  ecosystemModules,
  executiveMetrics,
  executiveSummary,
  focusAccounts,
  intelligenceSignals,
} from "@/data/executive-center";
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

export function ExecutiveCenter() {
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
            Product intelligence active
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {ecosystemModules.map((module) => (
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
        {executiveMetrics.map((metric) => (
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
              {metric.value}
            </p>
            <p className="mt-2 text-sm text-zinc-500">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-base font-semibold text-zinc-950">
              Contas Prioritárias
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
                  <th className="px-5 py-3">Ação sugerida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
            {focusAccounts.map((account) => (
              <tr className="align-top text-sm text-zinc-600" key={account.name}>
                <td className="px-5 py-4 font-medium text-zinc-950">
                  {account.name}
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
              <p className="text-xs text-zinc-400">Risk Score Médio</p>
              <p className="mt-1 text-2xl font-semibold">
                {executiveSummary.averageRiskScore}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
              <p className="text-xs text-zinc-400">
                Recomendações Prioritárias
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {executiveSummary.priorityRecommendations}
              </p>
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
