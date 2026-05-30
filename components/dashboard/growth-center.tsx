"use client";

import { Radar, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { GrowthResponse } from "@/lib/google-sheets/types";
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

export function GrowthCenter() {
  const [growth, setGrowth] = useState<GrowthResponse>({
    insights: [],
    jtbd: [],
    radar: { expansion: 0, operationalEfficiency: 0, retention: 0 },
    recommendations: [],
    source: "not-configured",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("All");

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
        const matchesCategory = category === "All" || row.category === category;
        const matchesPriority = priority === "All" || row.priority === priority;
        const matchesStatus = status === "All" || row.status === status;

        return matchesCategory && matchesPriority && matchesStatus;
      }),
    [category, growth.jtbd, priority, status],
  );

  const filteredInsights = useMemo(
    () =>
      growth.insights.filter((row) => {
        const matchesCategory = category === "All" || row.category === category;
        const matchesPriority = priority === "All" || row.priority === priority;
        const matchesStatus = status === "All" || row.status === status;

        return matchesCategory && matchesPriority && matchesStatus;
      }),
    [category, growth.insights, priority, status],
  );

  const filteredRecommendations = useMemo(
    () =>
      growth.recommendations.filter((row) => {
        const matchesPriority = priority === "All" || row.priority === priority;
        const matchesStatus = status === "All" || row.status === status;

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
        label: "Recomendacoes Ativas",
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
        label: "Jobs Criticos",
        value: criticalJobs.length,
      },
      {
        detail: "Strategic priority score",
        label: "Opportunity Score Medio",
        value: average(
          growth.recommendations.map((row) => row.opportunityScore),
        ),
      },
    ];
  }, [growth]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Market & Growth Intelligence
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Growth Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Consolidate jobs to be done, strategic insights and
              recommendations into growth opportunities.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <Radar className="size-4 text-zinc-950" />
            {isLoading ? "Loading growth data" : growth.source}
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

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
            <Search className="size-4 text-zinc-400" />
            <span className="px-3 text-sm text-zinc-500">
              Filters for growth intelligence
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[540px]">
            <FilterSelect
              label="Priority"
              onChange={setPriority}
              options={filterOptions.priorities}
              value={priority}
            />
            <FilterSelect
              label="Category"
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
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <TableCard title="Jobs To Be Done">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                <th className="px-5 py-3">Job</th>
                <th className="px-5 py-3">Frequencia</th>
                <th className="px-5 py-3">Impacto</th>
                <th className="px-5 py-3">Prioridade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredJtbd.map((row) => (
                <tr className="align-top text-sm text-zinc-600" key={row.id}>
                  <td className="max-w-[360px] px-5 py-4 font-medium text-zinc-950">
                    {row.job}
                  </td>
                  <td className="px-5 py-4">{row.frequency}</td>
                  <td className="px-5 py-4">{row.impact}</td>
                  <td className="px-5 py-4">
                    <Badge value={row.priority} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Opportunity Radar
          </p>
          <div className="mt-4 space-y-3">
            <RadarItem label="Retencao" value={growth.radar.retention} />
            <RadarItem label="Expansao" value={growth.radar.expansion} />
            <RadarItem
              label="Eficiencia operacional"
              value={growth.radar.operationalEfficiency}
            />
          </div>
        </div>
      </section>

      <TableCard title="Strategic Insights">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
              <th className="px-5 py-3">Insight</th>
              <th className="px-5 py-3">Categoria</th>
              <th className="px-5 py-3">Conta Relacionada</th>
              <th className="px-5 py-3">Impacto</th>
              <th className="px-5 py-3">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredInsights.map((row) => (
              <tr className="align-top text-sm text-zinc-600" key={row.id}>
                <td className="max-w-[360px] px-5 py-4 font-medium text-zinc-950">
                  {row.insight}
                </td>
                <td className="px-5 py-4">{row.category}</td>
                <td className="px-5 py-4">{row.accountName}</td>
                <td className="px-5 py-4">
                  <Badge value={row.impact} />
                </td>
                <td className="px-5 py-4">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <TableCard title="Strategic Recommendations">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
              <th className="px-5 py-3">Recomendacao</th>
              <th className="px-5 py-3">Prioridade</th>
              <th className="px-5 py-3">Area Responsavel</th>
              <th className="px-5 py-3">Impacto Estimado</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredRecommendations.map((row) => (
              <tr className="align-top text-sm text-zinc-600" key={row.id}>
                <td className="max-w-[360px] px-5 py-4 font-medium text-zinc-950">
                  {row.recommendation}
                </td>
                <td className="px-5 py-4">
                  <Badge value={row.priority} />
                </td>
                <td className="px-5 py-4">{row.area}</td>
                <td className="px-5 py-4">{row.estimatedImpact}</td>
                <td className="px-5 py-4">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
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

function TableCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
