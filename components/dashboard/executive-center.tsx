import { ArrowUpRight, Sparkles } from "lucide-react";

import {
  executiveMetrics,
  focusAccounts,
  intelligenceSignals,
} from "@/data/executive-center";
import { cn } from "@/lib/utils";

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
              A focused command center for account health, onboarding momentum,
              risk signals, and growth opportunities.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <Sparkles className="size-4 text-zinc-950" />
            AI signals active
          </div>
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
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
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
              Priority Accounts
            </h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {focusAccounts.map((account) => (
              <div
                className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_120px_130px_80px] sm:items-center"
                key={account.name}
              >
                <div>
                  <p className="font-medium text-zinc-950">{account.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Owner: {account.owner}
                  </p>
                </div>
                <p className="text-sm text-zinc-600">{account.stage}</p>
                <span
                  className={cn(
                    "w-fit rounded-md px-2 py-1 text-xs font-medium",
                    account.health === "Strong" &&
                      "bg-emerald-50 text-emerald-700",
                    account.health === "Watch" &&
                      "bg-amber-50 text-amber-700",
                    account.health === "Needs action" &&
                      "bg-rose-50 text-rose-700",
                  )}
                >
                  {account.health}
                </span>
                <p className="text-sm font-semibold text-zinc-950">
                  {account.score}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">AI Copilot Brief</h2>
            <ArrowUpRight className="size-4 text-zinc-400" />
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
