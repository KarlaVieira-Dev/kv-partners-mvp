"use client";

import { MessageSquareText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  FeedbackRow,
  FeedbacksResponse,
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
  const [account, setAccount] = useState("Todos");
  const [priority, setPriority] = useState("Todos");
  const [sentiment, setSentiment] = useState("Todos");
  const [status, setStatus] = useState("Todos");

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
        account === "Todos" || feedback.accountName === account;
      const matchesPriority =
        priority === "Todos" || feedback.priority === priority;
      const matchesSentiment =
        sentiment === "Todos" || feedback.sentiment === sentiment;
      const matchesStatus = status === "Todos" || feedback.status === status;

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
        label: "Feedbacks Críticos",
        value: critical.length,
      },
      {
        detail: "Ainda não resolvidos",
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
        label: "Sentimento Médio",
        value: average(feedbacks.map((feedback) => sentimentScore(feedback.sentiment))),
      },
    ];
  }, [feedbacks]);

  const { page, paginatedRows, setPage } =
    usePaginatedRows(filteredFeedbacks);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-white/10 bg-[#050810] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">
              Inteligencia de Feedbacks
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Centro de Feedbacks
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Acompanhe sentimento, prioridade, temas recorrentes e status de
              resolução dos feedbacks por conta.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0c1120] px-3 py-2 text-sm text-zinc-400">
            <MessageSquareText className="size-4 text-white" />
            {isLoading ? "Carregando feedbacks" : `${filteredFeedbacks.length} registros`}
          </div>
        </div>
      </section>

      <KPIGrid isLoading={isLoading} metrics={metrics} />

      <section className="grid gap-4 xl:grid-cols-3">
        <DistributionCard
          items={sentimentDistribution}
          title="Distribuição por Sentimento"
        />
        <DistributionCard
          items={priorityDistribution}
          title="Distribuição por Prioridade"
        />
        <div className="rounded-lg border border-white/10 bg-[#050810] p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Temas Recorrentes</p>
          <div className="mt-4 space-y-2">
            {recurringThemes.map(([theme, count]) => (
              <div
                className="flex items-center justify-between rounded-lg border border-zinc-100 bg-[#0c1120] px-3 py-2"
                key={theme}
              >
                <span className="text-sm font-medium text-zinc-700">
                  {theme}
                </span>
                <span className="text-sm text-zinc-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FilterBar>
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-white/10 bg-[#0c1120] px-3">
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
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[540px]">
            <FilterSelect
              label="Sentimento"
              onChange={setSentiment}
              options={filterOptions.sentiments}
              value={sentiment}
            />
            <FilterSelect
              label="Prioridade"
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
      </FilterBar>

      <DataTable
        columns={[
          { header: "Data", render: (feedback) => feedback.date },
          {
            className: "font-medium text-white",
            header: "Conta",
            render: (feedback) => feedback.accountName,
          },
          { header: "Categoria", render: (feedback) => feedback.category },
          { header: "Tema", render: (feedback) => feedback.theme },
          {
            header: "Sentimento",
            render: (feedback) => (
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  badgeColor(feedback.sentiment),
                )}
              >
                {feedback.sentiment}
              </span>
            ),
          },
          {
            header: "Prioridade",
            render: (feedback) => (
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  badgeColor(feedback.priority),
                )}
              >
                {feedback.priority}
              </span>
            ),
          },
          { header: "Status", render: (feedback) => feedback.status },
          {
            className: "max-w-[280px] leading-6",
            header: "Resumo",
            render: (feedback) => feedback.summary,
          },
        ]}
        emptyMessage="Nenhum feedback corresponde aos filtros selecionados."
        getRowKey={(feedback) => feedback.id}
        isLoading={isLoading}
        minWidth="1040px"
        rows={paginatedRows}
        title="Tabela de Feedbacks"
      />

      <Pagination
        currentPage={page}
        onPageChange={setPage}
        totalItems={filteredFeedbacks.length}
      />

      <IntelligentSummary
        items={[
          "Feedbacks críticos e negativos indicam fricções que merecem resposta executiva.",
          "Temas recorrentes ajudam a transformar sinais dispersos em pauta de produto.",
          "Prioridade e status mostram se os pontos mais sensiveis estao avancando.",
        ]}
        meta={[
          { label: "Feedbacks filtrados", value: filteredFeedbacks.length },
          { label: "Sentimento médio", value: metrics[4]?.value ?? 0 },
        ]}
      />
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
    <div className="rounded-lg border border-white/10 bg-[#050810] p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div className="rounded-lg border border-zinc-100 bg-[#0c1120] p-3" key={item.label}>
            <p className="text-xs text-zinc-400">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">
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
    <label className="flex flex-col gap-1 text-xs font-medium text-zinc-400">
      {label}
      <select
        className="h-10 rounded-lg border border-white/10 bg-[#0c1120] px-3 text-sm font-normal text-zinc-900 outline-none transition focus:border-zinc-400"
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
