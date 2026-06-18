"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type KPIMetric = {
  detail?: string;
  label: string;
  trend?: string;
  value: number | string;
};

export function KPIGrid({
  isLoading,
  metrics,
}: {
  isLoading?: boolean;
  metrics: KPIMetric[];
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.slice(0, 4).map((metric) => (
        <article
          className="rounded-lg border border-white/10 bg-[#050810] p-5 shadow-sm"
          key={metric.label}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-zinc-400">{metric.label}</p>
            {metric.trend ? (
              <span className="rounded-md bg-[#111827] px-2 py-1 text-xs font-medium text-zinc-700">
                {metric.trend}
              </span>
            ) : null}
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {isLoading ? "..." : metric.value}
          </p>
          {metric.detail ? (
            <p className="mt-2 text-sm text-zinc-400">{metric.detail}</p>
          ) : null}
        </article>
      ))}
    </section>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#050810] p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {children}
      </div>
    </section>
  );
}

export type DataTableColumn<T> = {
  className?: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  emptyMessage,
  getRowKey,
  isLoading,
  minWidth = "980px",
  rows,
  title,
}: {
  columns: Array<DataTableColumn<T>>;
  emptyMessage: string;
  getRowKey: (row: T, index: number) => string;
  isLoading?: boolean;
  minWidth?: string;
  rows: T[];
  title: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#050810] shadow-sm">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-left"
          style={{ minWidth }}
        >
          <thead>
            <tr className="border-b border-white/10 bg-[#0c1120] text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
              {columns.map((column) => (
                <th className="px-5 py-3" key={column.header}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row, index) => (
              <tr
                className="align-top text-sm text-zinc-400"
                key={getRowKey(row, index)}
              >
                {columns.map((column) => (
                  <td
                    className={cn("px-5 py-4", column.className)}
                    key={column.header}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!isLoading && rows.length === 0 ? (
        <div className="border-t border-zinc-100 px-5 py-10 text-center text-sm text-zinc-400">
          {emptyMessage}
        </div>
      ) : null}
    </section>
  );
}

export function Pagination({
  currentPage,
  onPageChange,
  pageSize = 10,
  totalItems,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems: number;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const normalizedPage = Math.min(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#050810] px-4 py-3 text-sm text-zinc-400 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <span>
        Página {normalizedPage} de {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button
          className="gap-2"
          disabled={normalizedPage <= 1}
          onClick={() => onPageChange(normalizedPage - 1)}
          size="sm"
          type="button"
          variant="outline"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <Button
          className="gap-2"
          disabled={normalizedPage >= totalPages}
          onClick={() => onPageChange(normalizedPage + 1)}
          size="sm"
          type="button"
          variant="outline"
        >
          Próxima
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function IntelligentSummary({
  items,
  meta,
  title = "Resumo Inteligente",
}: {
  items: string[];
  meta?: Array<{ label: string; value: number | string }>;
  title?: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#2563eb] p-5 text-white shadow-sm">
      <h2 className="text-base font-semibold">{title}</h2>
      {meta ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {meta.map((item) => (
            <div
              className="rounded-lg border border-white/10 bg-[#050810]/[0.06] p-3"
              key={item.label}
            >
              <p className="text-xs text-zinc-400">{item.label}</p>
              <p className="mt-1 text-lg font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <p
            className="rounded-lg border border-white/10 bg-[#050810]/[0.06] p-3 text-sm leading-6 text-zinc-200"
            key={item}
          >
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}

export function usePaginatedRows<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [items, pageSize]);

  const paginatedRows = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize, totalPages]);

  return {
    page: Math.min(page, totalPages),
    paginatedRows,
    setPage,
  };
}
