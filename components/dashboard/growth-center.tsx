"use client";

import { Radar, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { GrowthResponse, RiskRow, RisksResponse } from "@/lib/google-sheets/types";
import { cn } from "@/lib/utils";
import {
  DataTable,
  FilterBar,
  IntelligentSummary,
  KPIGrid,
  Pagination,
  usePaginatedRows,
} from "./shared";

const emptyGrowth: GrowthResponse = {
  benchmarks: [],
  competitiveRadar: [],
  insights: [],
  jtbd: [],
  marketTrends: [],
  radar: { expansion: 0, operationalEfficiency: 0, retention: 0 },
  recommendations: [],
  source: "not-configured",
};

const uniqueOptions = (values: string[]) => [
  "Todos",
  ...Array.from(new Set(values.filter(Boolean))).sort(),
];

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const badgeColor = (value: string) => {
  const normalized = normalize(value);

  if (
    normalized.includes("crit") ||
    normalized.includes("alta") ||
    normalized.includes("abaixo")
  ) {
    return "bg-rose-50 text-rose-700";
  }

  if (
    normalized.includes("medio") ||
    normalized.includes("planejada") ||
    normalized.includes("estavel")
  ) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
};

const sourceLabel = (source: GrowthResponse["source"]) =>
  source === "google-sheets" ? "Google Sheets" : "Planilha pendente";

const matches = (selected: string, value: string) =>
  selected === "Todos" || value === selected;

const isHighPriority = (value: string) => {
  const normalized = normalize(value);
  return normalized.includes("alta") || normalized.includes("crit");
};

const opportunityScore = (healthScore: number, riskScore: number) =>
  Math.round(healthScore - riskScore * 0.5);

type OpportunityRadarRow = {
  area: string;
  description: string;
  value: number;
};

export function GrowthCenter() {
  const [growth, setGrowth] = useState<GrowthResponse>(emptyGrowth);
  const [risks, setRisks] = useState<RiskRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [strategicCategory, setStrategicCategory] = useState("Todos");
  const [strategicPriority, setStrategicPriority] = useState("Todos");
  const [strategicStatus, setStrategicStatus] = useState("Todos");

  const [trendCategory, setTrendCategory] = useState("Todos");
  const [trendImpact, setTrendImpact] = useState("Todos");
  const [trendPriority, setTrendPriority] = useState("Todos");

  const [competitor, setCompetitor] = useState("Todos");
  const [competitorCategory, setCompetitorCategory] = useState("Todos");
  const [competitorImpact, setCompetitorImpact] = useState("Todos");

  const [benchmarkCategory, setBenchmarkCategory] = useState("Todos");
  const [benchmarkStatus, setBenchmarkStatus] = useState("Todos");
  const [benchmarkPriority, setBenchmarkPriority] = useState("Todos");

  useEffect(() => {
    async function loadGrowth() {
      try {
        const [growthResponse, risksResponse] = await Promise.all([
          fetch("/api/growth"),
          fetch("/api/risks"),
        ]);
        const data = (await growthResponse.json()) as GrowthResponse;
        const risksData = (await risksResponse.json()) as RisksResponse;

        setGrowth({
          ...emptyGrowth,
          ...data,
          benchmarks: data.benchmarks ?? [],
          competitiveRadar: data.competitiveRadar ?? [],
          marketTrends: data.marketTrends ?? [],
        });
        setRisks(risksData.risks);
      } finally {
        setIsLoading(false);
      }
    }

    loadGrowth();
  }, []);

  const strategicFilterOptions = useMemo(
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

  const trendFilterOptions = useMemo(
    () => ({
      categories: uniqueOptions(growth.marketTrends.map((row) => row.category)),
      impacts: uniqueOptions(growth.marketTrends.map((row) => row.impact)),
      priorities: uniqueOptions(growth.marketTrends.map((row) => row.priority)),
    }),
    [growth.marketTrends],
  );

  const competitorFilterOptions = useMemo(
    () => ({
      categories: uniqueOptions(
        growth.competitiveRadar.map((row) => row.category),
      ),
      competitors: uniqueOptions(
        growth.competitiveRadar.map((row) => row.competitor),
      ),
      impacts: uniqueOptions(growth.competitiveRadar.map((row) => row.impact)),
    }),
    [growth.competitiveRadar],
  );

  const benchmarkFilterOptions = useMemo(
    () => ({
      categories: uniqueOptions(growth.benchmarks.map((row) => row.category)),
      priorities: uniqueOptions(growth.benchmarks.map((row) => row.priority)),
      statuses: uniqueOptions(
        growth.benchmarks.map((row) => row.comparativeStatus),
      ),
    }),
    [growth.benchmarks],
  );

  const filteredJtbd = useMemo(
    () =>
      growth.jtbd.filter(
        (row) =>
          matches(strategicCategory, row.category) &&
          matches(strategicPriority, row.priority) &&
          matches(strategicStatus, row.status),
      ),
    [growth.jtbd, strategicCategory, strategicPriority, strategicStatus],
  );

  const filteredInsights = useMemo(
    () =>
      growth.insights.filter(
        (row) =>
          matches(strategicCategory, row.category) &&
          matches(strategicPriority, row.priority) &&
          matches(strategicStatus, row.status),
      ),
    [growth.insights, strategicCategory, strategicPriority, strategicStatus],
  );

  const filteredRecommendations = useMemo(
    () =>
      growth.recommendations.filter(
        (row) =>
          matches(strategicPriority, row.priority) &&
          matches(strategicStatus, row.status),
      ),
    [growth.recommendations, strategicPriority, strategicStatus],
  );

  const filteredMarketTrends = useMemo(
    () =>
      growth.marketTrends.filter(
        (row) =>
          matches(trendCategory, row.category) &&
          matches(trendImpact, row.impact) &&
          matches(trendPriority, row.priority),
      ),
    [growth.marketTrends, trendCategory, trendImpact, trendPriority],
  );

  const filteredCompetitiveRadar = useMemo(
    () =>
      growth.competitiveRadar.filter(
        (row) =>
          matches(competitor, row.competitor) &&
          matches(competitorCategory, row.category) &&
          matches(competitorImpact, row.impact),
      ),
    [
      competitor,
      competitorCategory,
      competitorImpact,
      growth.competitiveRadar,
    ],
  );

  const filteredBenchmarks = useMemo(
    () =>
      growth.benchmarks.filter(
        (row) =>
          matches(benchmarkCategory, row.category) &&
          matches(benchmarkStatus, row.comparativeStatus) &&
          matches(benchmarkPriority, row.priority),
      ),
    [benchmarkCategory, benchmarkPriority, benchmarkStatus, growth.benchmarks],
  );

  const metrics = useMemo(() => {
    const criticalJobs = growth.jtbd.filter((row) =>
      isHighPriority(row.priority),
    );

    return [
      {
        detail: "JTBD com prioridade alta ou critica",
        label: "Jobs Críticos",
        value: criticalJobs.length,
      },
      {
        detail: "Registros em 09_MGI_Insights",
        label: "Insights Estratégicos",
        value: growth.insights.length,
      },
      {
        detail: "Registros em 11_MGI_Market_Trends",
        label: "Tendências Monitoradas",
        value: growth.marketTrends.length,
      },
      {
        detail: "Registros em 13_MGI_Benchmarks",
        label: "Benchmarks Monitorados",
        value: growth.benchmarks.length,
      },
    ];
  }, [growth]);

  const topOpportunities = useMemo(
    () =>
      [...risks]
        .sort(
          (first, second) =>
            opportunityScore(second.healthScore, second.riskScore) -
            opportunityScore(first.healthScore, first.riskScore),
        )
        .slice(0, 3),
    [risks],
  );

  const opportunityRadarRows = useMemo<OpportunityRadarRow[]>(
    () => [
      {
        area: "Retenção",
        description: "Sinais ligados a churn, adoção e recorrência.",
        value: growth.radar.retention,
      },
      {
        area: "Expansão",
        description: "Sinais ligados a upsell, cross-sell e crescimento.",
        value: growth.radar.expansion,
      },
      {
        area: "Eficiência operacional",
        description: "Sinais ligados a automação, permissões e processos.",
        value: growth.radar.operationalEfficiency,
      },
    ],
    [growth.radar],
  );

  const summaryItems = useMemo(
    () => buildSummaryItems(growth),
    [growth],
  );

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
  const {
    page: trendsPage,
    paginatedRows: paginatedMarketTrends,
    setPage: setTrendsPage,
  } = usePaginatedRows(filteredMarketTrends);
  const {
    page: competitivePage,
    paginatedRows: paginatedCompetitiveRadar,
    setPage: setCompetitivePage,
  } = usePaginatedRows(filteredCompetitiveRadar);
  const {
    page: benchmarksPage,
    paginatedRows: paginatedBenchmarks,
    setPage: setBenchmarksPage,
  } = usePaginatedRows(filteredBenchmarks);

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
              Hub estratégico para consolidar JTBD, insights, recomendações,
              tendências de mercado, radar competitivo e benchmarks.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <Radar className="size-4 text-zinc-950" />
            {isLoading
              ? "Carregando dados de crescimento"
              : sourceLabel(growth.source)}
          </div>
        </div>
      </section>

      <KPIGrid isLoading={isLoading} metrics={metrics} />

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Opportunity Intelligence
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
              Top Oportunidades
            </h2>
          </div>
          <p className="text-sm text-zinc-500">
            Opportunity = Health Score - (Risk Score * 0.5)
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {topOpportunities.map((opportunity) => (
            <article
              className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
              key={opportunity.accountId}
            >
              <p className="text-sm font-semibold text-zinc-950">
                {opportunity.accountName}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
                {opportunityScore(
                  opportunity.healthScore,
                  opportunity.riskScore,
                )}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Health {opportunity.healthScore} | Risk {opportunity.riskScore}
              </p>
            </article>
          ))}
        </div>
      </section>

      <FilterBar>
        <FilterLabel text="Filtros estratégicos" />
        <div className="grid gap-3 sm:grid-cols-3 lg:w-[540px]">
          <FilterSelect
            label="Prioridade"
            onChange={setStrategicPriority}
            options={strategicFilterOptions.priorities}
            value={strategicPriority}
          />
          <FilterSelect
            label="Categoria"
            onChange={setStrategicCategory}
            options={strategicFilterOptions.categories}
            value={strategicCategory}
          />
          <FilterSelect
            label="Status"
            onChange={setStrategicStatus}
            options={strategicFilterOptions.statuses}
            value={strategicStatus}
          />
        </div>
      </FilterBar>

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
          { header: "Área Responsável", render: (row) => row.area },
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

      <FilterBar>
        <FilterLabel text="Filtros de tendências de mercado" />
        <div className="grid gap-3 sm:grid-cols-3 lg:w-[540px]">
          <FilterSelect
            label="Categoria"
            onChange={setTrendCategory}
            options={trendFilterOptions.categories}
            value={trendCategory}
          />
          <FilterSelect
            label="Impacto"
            onChange={setTrendImpact}
            options={trendFilterOptions.impacts}
            value={trendImpact}
          />
          <FilterSelect
            label="Prioridade"
            onChange={setTrendPriority}
            options={trendFilterOptions.priorities}
            value={trendPriority}
          />
        </div>
      </FilterBar>

      <DataTable
        columns={[
          {
            className: "font-medium text-zinc-950",
            header: "Tema",
            render: (row) => row.theme,
          },
          { header: "Categoria", render: (row) => row.category },
          { header: "Direção", render: (row) => row.direction },
          { header: "Impacto", render: (row) => <Badge value={row.impact} /> },
          {
            header: "Prioridade",
            render: (row) => <Badge value={row.priority} />,
          },
          { header: "Fonte", render: (row) => row.source },
        ]}
        emptyMessage="Nenhuma tendência corresponde aos filtros selecionados."
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        minWidth="980px"
        rows={paginatedMarketTrends}
        title="Tendências de Mercado"
      />
      <Pagination
        currentPage={trendsPage}
        onPageChange={setTrendsPage}
        totalItems={filteredMarketTrends.length}
      />

      <FilterBar>
        <FilterLabel text="Filtros do radar competitivo" />
        <div className="grid gap-3 sm:grid-cols-3 lg:w-[540px]">
          <FilterSelect
            label="Concorrente"
            onChange={setCompetitor}
            options={competitorFilterOptions.competitors}
            value={competitor}
          />
          <FilterSelect
            label="Categoria"
            onChange={setCompetitorCategory}
            options={competitorFilterOptions.categories}
            value={competitorCategory}
          />
          <FilterSelect
            label="Impacto"
            onChange={setCompetitorImpact}
            options={competitorFilterOptions.impacts}
            value={competitorImpact}
          />
        </div>
      </FilterBar>

      <DataTable
        columns={[
          {
            className: "font-medium text-zinc-950",
            header: "Concorrente",
            render: (row) => row.competitor,
          },
          { header: "Categoria", render: (row) => row.category },
          {
            className: "max-w-[360px] leading-6",
            header: "Movimento",
            render: (row) => row.movement,
          },
          { header: "Impacto", render: (row) => <Badge value={row.impact} /> },
          { header: "Data", render: (row) => row.date },
          { header: "Fonte", render: (row) => row.source },
        ]}
        emptyMessage="Nenhum movimento competitivo corresponde aos filtros selecionados."
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        minWidth="980px"
        rows={paginatedCompetitiveRadar}
        title="Radar Competitivo"
      />
      <Pagination
        currentPage={competitivePage}
        onPageChange={setCompetitivePage}
        totalItems={filteredCompetitiveRadar.length}
      />

      <FilterBar>
        <FilterLabel text="Filtros de benchmarks" />
        <div className="grid gap-3 sm:grid-cols-3 lg:w-[540px]">
          <FilterSelect
            label="Categoria"
            onChange={setBenchmarkCategory}
            options={benchmarkFilterOptions.categories}
            value={benchmarkCategory}
          />
          <FilterSelect
            label="Status comparativo"
            onChange={setBenchmarkStatus}
            options={benchmarkFilterOptions.statuses}
            value={benchmarkStatus}
          />
          <FilterSelect
            label="Prioridade"
            onChange={setBenchmarkPriority}
            options={benchmarkFilterOptions.priorities}
            value={benchmarkPriority}
          />
        </div>
      </FilterBar>

      <DataTable
        columns={[
          {
            className: "font-medium text-zinc-950",
            header: "Métrica",
            render: (row) => row.metric,
          },
          { header: "Categoria", render: (row) => row.category },
          { header: "Valor KV Partners", render: (row) => row.kvValue },
          { header: "Valor Mercado", render: (row) => row.marketValue },
          { header: "Diferença", render: (row) => row.difference },
          {
            header: "Status Comparativo",
            render: (row) => <Badge value={row.comparativeStatus} />,
          },
          { header: "Impacto", render: (row) => <Badge value={row.impact} /> },
          {
            header: "Prioridade",
            render: (row) => <Badge value={row.priority} />,
          },
        ]}
        emptyMessage="Nenhum benchmark corresponde aos filtros selecionados."
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        minWidth="1180px"
        rows={paginatedBenchmarks}
        title="Benchmark de Mercado"
      />
      <Pagination
        currentPage={benchmarksPage}
        onPageChange={setBenchmarksPage}
        totalItems={filteredBenchmarks.length}
      />

      <DataTable
        columns={[
          {
            className: "font-medium text-zinc-950",
            header: "Área",
            render: (row) => row.area,
          },
          { header: "Sinais", render: (row) => row.value },
          {
            className: "max-w-[420px] leading-6",
            header: "Leitura estratégica",
            render: (row) => row.description,
          },
        ]}
        emptyMessage="Nenhum sinal de oportunidade encontrado."
        getRowKey={(row) => row.area}
        isLoading={isLoading}
        minWidth="760px"
        rows={opportunityRadarRows}
        title="Radar de Oportunidades"
      />

      <IntelligentSummary
        items={summaryItems}
        meta={[
          { label: "JTBD", value: growth.jtbd.length },
          { label: "Insights", value: growth.insights.length },
          { label: "Recomendações", value: growth.recommendations.length },
          { label: "Tendências", value: growth.marketTrends.length },
          { label: "Concorrentes", value: growth.competitiveRadar.length },
          { label: "Benchmarks", value: growth.benchmarks.length },
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
      {value || "Sem dado"}
    </span>
  );
}

function FilterLabel({ text }: { text: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
      <Search className="size-4 text-zinc-400" />
      <span className="px-3 text-sm text-zinc-500">{text}</span>
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

function buildSummaryItems(growth: GrowthResponse) {
  const criticalTrends = topLabels(
    growth.marketTrends.filter(
      (trend) => isHighPriority(trend.priority) || isHighPriority(trend.impact),
    ),
    (trend) => trend.theme,
    3,
  );
  const activeCompetitors = topLabels(
    growth.competitiveRadar,
    (row) => row.competitor,
    3,
  );
  const benchmarkOpportunity = growth.benchmarks.find((benchmark) =>
    normalize(benchmark.comparativeStatus).includes("abaixo"),
  );
  const retentionBenchmark = growth.benchmarks.find((benchmark) =>
    normalize(`${benchmark.metric} ${benchmark.category}`).includes("retenc"),
  );
  const timeToValueBenchmark = growth.benchmarks.find((benchmark) =>
    normalize(benchmark.metric).includes("time to value"),
  );

  return [
    criticalTrends.length > 0
      ? `Tendências críticas identificadas: ${criticalTrends.join(", ")}.`
      : "Nenhuma tendência crítica foi identificada nos dados atuais.",
    activeCompetitors.length > 0
      ? `Concorrentes mais ativos: ${activeCompetitors.join(", ")}.`
      : "Nenhum movimento competitivo foi identificado nos dados atuais.",
    benchmarkOpportunity
      ? `Benchmark indica oportunidade de melhoria em ${benchmarkOpportunity.metric}.`
      : "Benchmarks não indicam gaps críticos de mercado no momento.",
    retentionBenchmark &&
    normalize(retentionBenchmark.comparativeStatus).includes("acima")
      ? "Retenção está acima da média do mercado."
      : "Retenção deve seguir monitorada frente aos benchmarks de mercado.",
    timeToValueBenchmark &&
    normalize(timeToValueBenchmark.comparativeStatus).includes("acima")
      ? "Time To Value está acima do benchmark e merece atenção."
      : "Time To Value não apresenta alerta acima do benchmark nos dados atuais.",
  ];
}

function topLabels<T>(
  rows: T[],
  getLabel: (row: T) => string,
  limit: number,
) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const label = getLabel(row);

    if (label) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((first, second) => second[1] - first[1])
    .slice(0, limit)
    .map(([label]) => label);
}
