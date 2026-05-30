"use client";

import { Radar, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { GrowthResponse } from "@/lib/google-sheets/types";
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

const badgeColor = (value: string) => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("crit") || normalized.includes("alta")) {
    return "bg-rose-50 text-rose-700";
  }

  if (normalized.includes("medio") || normalized.includes("planejada")) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
};

const sourceLabel = (source: GrowthResponse["source"]) =>
  source === "google-sheets" ? "Google Sheets" : "Planilha pendente";

export function GrowthCenter() {
  const [growth, setGrowth] = useState<GrowthResponse>({
    insights: [],
    jtbd: [],
    radar: { expansion: 0, operationalEfficiency: 0, retention: 0 },
    recommendations: [],
    source: "not-configured",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("Todos");
  const [priority, setPriority] = useState("Todos");
  const [status, setStatus] = useState("Todos");

  useEffect(() => {
    async function loadGrowth() {
      try {
        const response = await fetch("/api/growth");
        const data = (await response.json()) as GrowthResponse;

        setGrowth(data);
      } finally {
        setIsLoading(false);
      }
    }

    loadGrowth();
  }, []);

  const filterOptions = useMemo(
    () => ({
      categories: uniqueOptions([
        ...growth.jtbd.map((row) => row.category),
        ...growth.insights.map((row) => row.category),
      ]),
      priorities: uniqueOptions([
        ...growth.jtbd.map((row) => row.priority),
        ...growth.insights.map((row) => row.priority),
        ...growth.recommendations.map((row) => row.priority),
      ]),
      statuses: uniqueOptions([
        ...growth.jtbd.map((row) => row.status),
        ...growth.insights.map((row) => row.status),
        ...growth.recommendations.map((row) => row.status),
      ]),
    }),
    [growth],
  );

  const filteredJtbd = useMemo(
    () =>
      growth.jtbd.filter((row) => {
        const matchesCategory = category === "Todos" || row.category === category;
        const matchesPriority = priority === "Todos" || row.priority === priority;
        const matchesStatus = status === "Todos" || row.status === status;

        return matchesCategory && matchesPriority && matchesStatus;
      }),
    [category, growth.jtbd, priority, status],
  );

  const filteredInsights = useMemo(
    () =>
      growth.insights.filter((row) => {
        const matchesCategory = category === "Todos" || row.category === category;
        const matchesPriority = priority === "Todos" || row.priority === priority;
        const matchesStatus = status === "Todos" || row.status === status;

        return matchesCategory && matchesPriority && matchesStatus;
      }),
    [category, growth.insights, priority, status],
  );

  const filteredRecommendations = useMemo(
    () =>
      growth.recommendations.filter((row) => {
        const matchesPriority = priority === "Todos" || row.priority === priority;
        const matchesStatus = status === "Todos" || row.status === status;

        return matchesPriority && matchesStatus;
      }),
    [growth.recommendations, priority, status],
  );

  const metrics = useMemo(() => {
    const activeRecommendations = growth.recommendations.filter(
      (row) => !row.status.toLowerCase().includes("conclu"),
    );
    const criticalJobs = growth.jtbd.filter((row) => {
      const priorityValue = row.priority
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      return priorityValue.includes("alta") || priorityValue.includes("crit");
    });

    return [
      {
        detail: "Registros em 09_MGI_Insights",
        label: "Insights Gerados",
        value: growth.insights.length,
      },
      {
        detail: "Ainda nao concluidas",
        label: "Recomendações Ativas",
        value: activeRecommendations.length,
      },
      {
        detail: "Itens no radar",
        label: "Oportunidades Identificadas",
        value:
          growth.radar.expansion +
          growth.radar.operationalEfficiency +
          growth.radar.retention,
      },
      {
        detail: "Prioridade alta",
        label: "JTBD Críticos",
        value: criticalJobs.length,
      },
      {
        detail: "Pontuação de prioridade estratégica",
        label: "Índice de Oportunidade (Opportunity Score) Médio",
        value: average(
          growth.recommendations.map((row) => row.opportunityScore),
        ),
      },
    ];
  }, [growth]);

  const {
    page: jtbdPage,
    paginatedRows: paginatedJtbd,
    setPage: setJtbdPage,
  } = usePaginatedRows(filteredJtbd);
  const {
    page: insightsPage,
    paginatedRows: paginatedInsights,
    setPage: setInsightsPage,
  } = usePaginatedRows(filteredInsights);
  const {
    page: recommendationsPage,
    paginatedRows: paginatedRecommendations,
    setPage: setRecommendationsPage,
  } = usePaginatedRows(filteredRecommendations);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Inteligência de Mercado e Crescimento
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Centro de Crescimento
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Consolide JTBD, insights estratégicos e recomendações em
              oportunidades de crescimento.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <Radar className="size-4 text-zinc-950" />
            {isLoading ? "Carregando dados de crescimento" : sourceLabel(growth.source)}
          </div>
        </div>
      </section>

      <KPIGrid isLoading={isLoading} metrics={metrics} />

      <FilterBar>
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
            <Search className="size-4 text-zinc-400" />
            <span className="px-3 text-sm text-zinc-500">
              Filtros de inteligência de crescimento
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[540px]">
            <FilterSelect
              label="Prioridade"
              onChange={setPriority}
              options={filterOptions.priorities}
              value={priority}
            />
            <FilterSelect
              label="Categoria"
              onChange={setCategory}
              options={filterOptions.categories}
              value={category}
            />
            <FilterSelect
              label="Status"
              onChange={setStatus}
              options={filterOptions.statuses}
              value={status}
            />
          </div>
      </FilterBar>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col gap-3">
          <DataTable
            columns={[
              {
                className: "max-w-[360px] font-medium text-zinc-950",
                header: "Job",
                render: (row) => row.job,
              },
              { header: "Frequência", render: (row) => row.frequency },
              { header: "Impacto", render: (row) => row.impact },
              {
                header: "Prioridade",
                render: (row) => <Badge value={row.priority} />,
              },
            ]}
            emptyMessage="Nenhum JTBD corresponde aos filtros selecionados."
            getRowKey={(row) => row.id}
            isLoading={isLoading}
            minWidth="760px"
            rows={paginatedJtbd}
            title="JTBD"
          />
          <Pagination
            currentPage={jtbdPage}
            onPageChange={setJtbdPage}
            totalItems={filteredJtbd.length}
          />
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Radar de Oportunidades
          </p>
          <div className="mt-4 space-y-3">
            <RadarItem label="Retenção" value={growth.radar.retention} />
            <RadarItem label="Expansao" value={growth.radar.expansion} />
            <RadarItem
              label="Eficiencia operacional"
              value={growth.radar.operationalEfficiency}
            />
          </div>
        </div>
      </section>

      <DataTable
        columns={[
          {
            className: "max-w-[360px] font-medium text-zinc-950",
            header: "Insight",
            render: (row) => row.insight,
          },
          { header: "Categoria", render: (row) => row.category },
          { header: "Conta Relacionada", render: (row) => row.accountName },
          { header: "Impacto", render: (row) => <Badge value={row.impact} /> },
          { header: "Data", render: (row) => row.date },
        ]}
        emptyMessage="Nenhum insight corresponde aos filtros selecionados."
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        minWidth="980px"
        rows={paginatedInsights}
        title="Insights Estratégicos"
      />
      <Pagination
        currentPage={insightsPage}
        onPageChange={setInsightsPage}
        totalItems={filteredInsights.length}
      />

      <DataTable
        columns={[
          {
            className: "max-w-[360px] font-medium text-zinc-950",
            header: "Recomendação",
            render: (row) => row.recommendation,
          },
          {
            header: "Prioridade",
            render: (row) => <Badge value={row.priority} />,
          },
          { header: "Area Responsavel", render: (row) => row.area },
          { header: "Impacto Estimado", render: (row) => row.estimatedImpact },
          { header: "Status", render: (row) => row.status },
        ]}
        emptyMessage="Nenhuma recomendação corresponde aos filtros selecionados."
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        minWidth="980px"
        rows={paginatedRecommendations}
        title="Recomendações Estratégicas"
      />
      <Pagination
        currentPage={recommendationsPage}
        onPageChange={setRecommendationsPage}
        totalItems={filteredRecommendations.length}
      />

      <IntelligentSummary
        items={[
          "JTBD críticos mostram dores operacionais com maior potencial estratégico.",
          "Insights conectados a contas ajudam a priorizar retenção, expansão e eficiência.",
          "Recomendações ativas devem orientar a cadência entre produto, CS e operações.",
        ]}
        meta={[
          {
            label: "Índice de Oportunidade (Opportunity Score) médio",
            value: metrics[4]?.value ?? 0,
          },
          { label: "Fonte", value: sourceLabel(growth.source) },
        ]}
      />
    </div>
  );
}

function Badge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium",
        badgeColor(value),
      )}
    >
      {value}
    </span>
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

function RadarItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-3">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <span className="text-xl font-semibold text-zinc-950">{value}</span>
    </div>
  );
}
