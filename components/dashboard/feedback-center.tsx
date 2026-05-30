"use client";

import { MessageSquareText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  FeedbackRow,
  FeedbacksResponse,
} from "@/lib/google-sheets/types";
import { cn } from "@/lib/utils";

const uniqueOptions = (values: string[]) => [
  "All",
  ...Array.from(new Set(values.filter(Boolean))).sort(),
];

const sentimentScore = (sentiment: string) => {
  const normalized = sentiment.toLowerCase();

  if (normalized.includes("positivo")) {
    return 100;
  }

  if (normalized.includes("negativo")) {
    return 0;
  }

  return 50;
};

const average = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  );
};

const badgeColor = (value: string) => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("critica") || normalized.includes("negativo")) {
    return "bg-rose-50 text-rose-700";
  }

  if (normalized.includes("alta") || normalized.includes("neutro")) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
};

export function FeedbackCenter() {
  const [feedbacks, setFeedbacks] = useState<FeedbackRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState("All");
  const [priority, setPriority] = useState("All");
  const [sentiment, setSentiment] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    async function loadFeedbacks() {
      try {
        const response = await fetch("/api/feedbacks");
        const data = (await response.json()) as FeedbacksResponse;

        setFeedbacks(data.feedbacks);
      } finally {
        setIsLoading(false);
      }
    }

    loadFeedbacks();
  }, []);

  const filterOptions = useMemo(
    () => ({
      accounts: uniqueOptions(feedbacks.map((feedback) => feedback.accountName)),
      priorities: uniqueOptions(feedbacks.map((feedback) => feedback.priority)),
      sentiments: uniqueOptions(feedbacks.map((feedback) => feedback.sentiment)),
      statuses: uniqueOptions(feedbacks.map((feedback) => feedback.status)),
    }),
    [feedbacks],
  );

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) => {
      const matchesAccount =
        account === "All" || feedback.accountName === account;
      const matchesPriority =
        priority === "All" || feedback.priority === priority;
      const matchesSentiment =
        sentiment === "All" || feedback.sentiment === sentiment;
      const matchesStatus = status === "All" || feedback.status === status;

      return (
        matchesAccount && matchesPriority && matchesSentiment && matchesStatus
      );
    });
  }, [account, feedbacks, priority, sentiment, status]);

  const sentimentDistribution = useMemo(
    () =>
      ["Positivo", "Neutro", "Negativo"].map((label) => ({
        label,
        value: feedbacks.filter((feedback) =>
          feedback.sentiment.toLowerCase().includes(label.toLowerCase()),
        ).length,
      })),
    [feedbacks],
  );

  const priorityDistribution = useMemo(
    () =>
      ["Baixa", "Media", "Alta", "Critica"].map((label) => ({
        label,
        value: feedbacks.filter((feedback) =>
          feedback.priority
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes(label.toLowerCase()),
        ).length,
      })),
    [feedbacks],
  );

  const recurringThemes = useMemo(() => {
    const counts = new Map<string, number>();

    for (const feedback of feedbacks) {
      counts.set(feedback.theme, (counts.get(feedback.theme) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .filter(([theme]) => theme)
      .sort((first, second) => second[1] - first[1])
      .slice(0, 5);
  }, [feedbacks]);

  const metrics = useMemo(() => {
    const critical = feedbacks.filter((feedback) =>
      feedback.priority.toLowerCase().includes("crit"),
    );
    const open = feedbacks.filter((feedback) => {
      const normalized = feedback.status.toLowerCase();
      return !normalized.includes("resol") && !normalized.includes("conclu");
    });
    const resolved = feedbacks.filter((feedback) => {
      const normalized = feedback.status.toLowerCase();
      return normalized.includes("resol") || normalized.includes("conclu");
    });

    return [
      {
        detail: "Registros em 06_Feedbacks",
        label: "Total de Feedbacks",
        value: feedbacks.length,
      },
      {
        detail: "Criticidade critica",
        label: "Feedbacks Criticos",
        value: critical.length,
      },
      {
        detail: "Ainda nao resolvidos",
        label: "Feedbacks Abertos",
        value: open.length,
      },
      {
        detail: "Resolvidos ou concluidos",
        label: "Feedbacks Resolvidos",
        value: resolved.length,
      },
      {
        detail: "0 negativo, 100 positivo",
        label: "Sentimento Medio",
        value: average(feedbacks.map((feedback) => sentimentScore(feedback.sentiment))),
      },
    ];
  }, [feedbacks]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Feedback Intelligence
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Feedback Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Track customer feedback sentiment, priority, recurring themes, and
              resolution status across accounts.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <MessageSquareText className="size-4 text-zinc-950" />
            {isLoading ? "Loading feedbacks" : `${filteredFeedbacks.length} records`}
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

      <section className="grid gap-4 xl:grid-cols-3">
        <DistributionCard
          items={sentimentDistribution}
          title="Distribuicao por Sentimento"
        />
        <DistributionCard
          items={priorityDistribution}
          title="Distribuicao por Prioridade"
        />
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Temas Recorrentes</p>
          <div className="mt-4 space-y-2">
            {recurringThemes.map(([theme, count]) => (
              <div
                className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2"
                key={theme}
              >
                <span className="text-sm font-medium text-zinc-700">
                  {theme}
                </span>
                <span className="text-sm text-zinc-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
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
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[540px]">
            <FilterSelect
              label="Sentiment"
              onChange={setSentiment}
              options={filterOptions.sentiments}
              value={sentiment}
            />
            <FilterSelect
              label="Priority"
              onChange={setPriority}
              options={filterOptions.priorities}
              value={priority}
            />
            <FilterSelect
              label="Status"
              onChange={setStatus}
              options={filterOptions.statuses}
              value={status}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Conta</th>
                <th className="px-5 py-3">Categoria</th>
                <th className="px-5 py-3">Tema</th>
                <th className="px-5 py-3">Sentimento</th>
                <th className="px-5 py-3">Prioridade</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Resumo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredFeedbacks.map((feedback) => (
                <tr className="align-top text-sm text-zinc-600" key={feedback.id}>
                  <td className="px-5 py-4">{feedback.date}</td>
                  <td className="px-5 py-4 font-medium text-zinc-950">
                    {feedback.accountName}
                  </td>
                  <td className="px-5 py-4">{feedback.category}</td>
                  <td className="px-5 py-4">{feedback.theme}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium",
                        badgeColor(feedback.sentiment),
                      )}
                    >
                      {feedback.sentiment}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium",
                        badgeColor(feedback.priority),
                      )}
                    >
                      {feedback.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4">{feedback.status}</td>
                  <td className="max-w-[280px] px-5 py-4 leading-6">
                    {feedback.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredFeedbacks.length === 0 && (
          <div className="border-t border-zinc-100 px-5 py-10 text-center text-sm text-zinc-500">
            No feedback records match the selected filters.
          </div>
        )}
      </section>
    </div>
  );
}

function DistributionCard({
  items,
  title,
}: {
  items: Array<{ label: string; value: number }>;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3" key={item.label}>
            <p className="text-xs text-zinc-500">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-950">
              {item.value}
            </p>
          </div>
        ))}
      </div>
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
