"use client";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  ExecutiveAccountRow,
  ExecutiveAccountsResponse,
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

const scoreColor = (score: number) => {
  if (score >= 85) return "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20";
  if (score >= 70) return "bg-amber-950/40 text-amber-400 border border-amber-500/20";
  return "bg-rose-950/40 text-rose-400 border border-rose-500/20";
};

const riskColor = (score: number) => {
  if (score >= 70) return "bg-rose-950/40 text-rose-400 border border-rose-500/20";
  if (score >= 50) return "bg-amber-950/40 text-amber-400 border border-amber-500/20";
  return "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20";
};

const opportunityScore = (healthScore: number, riskScore: number) =>
  Math.round(healthScore - riskScore * 0.5);

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
};

const uniqueOptions = (values: string[]) => [
  "Todos",
  ...Array.from(new Set(values.filter(Boolean))).sort(),
];

const isManagerAccount = (type: string) => type.toLowerCase().includes("gestora");
const isManagedAccount = (type: string) => type.toLowerCase().includes("gerenciada");

export function AccountsCenter() {
  const [accounts, setAccounts] = useState<ExecutiveAccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("Todos");
  const [segment, setSegment] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [sortByOpportunity, setSortByOpportunity] = useState(true);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const response = await fetch("/api/accounts");
        const data = (await response.json()) as ExecutiveAccountsResponse;
        setAccounts(data.accounts);
      } finally {
        setIsLoading(false);
      }
    }
    loadAccounts();
  }, []);

  const filterOptions = useMemo(
    () => ({
      segments: uniqueOptions(accounts.map((account) => account.segment ?? "")),
      statuses: uniqueOptions(accounts.map((account) => account.status)),
      types: uniqueOptions(accounts.map((account) => account.type)),
    }),
    [accounts],
  );

  const filteredAccounts = useMemo(() => {
    const filtered = accounts.filter((account) => {
      const matchesSearch = account.account.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === "Todos" || account.type === type;
      const matchesSegment = segment === "Todos" || account.segment === segment;
      const matchesStatus = status === "Todos" || account.status === status;
      return matchesSearch && matchesType && matchesSegment && matchesStatus;
    });
    if (!sortByOpportunity) return filtered;
    return [...filtered].sort(
      (first, second) =>
        opportunityScore(second.healthScore, second.riskScore) -
        opportunityScore(first.healthScore, first.riskScore),
    );
  }, [accounts, search, segment, sortByOpportunity, status, type]);

  const metrics = useMemo(
    () => [
      { detail: "Base lida da aba 01_Contas", label: "Total de contas", value: accounts.length },
      { detail: "Tipo de conta gestora", label: "Contas Gestoras", value: accounts.filter((a) => isManagerAccount(a.type)).length },
      { detail: "Tipo de conta gerenciada", label: "Contas Gerenciadas", value: accounts.filter((a) => isManagedAccount(a.type)).length },
      { detail: "Média do IOI Score", label: "IOI Score médio", value: average(accounts.map((a) => a.healthScore)) },
    ],
    [accounts],
  );

  const { page, paginatedRows, setPage } = usePaginatedRows(filteredAccounts);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-white/10 bg-[#050810] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Inteligência de Contas</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Contas</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Monitore a saúde do portfólio, o contexto comercial e o status do ciclo de vida das contas no ecossistema.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0c1120] px-3 py-2 text-sm text-zinc-400">
            <SlidersHorizontal className="size-4 text-white" />
            {isLoading ? "Carregando contas" : `${filteredAccounts.length} contas`}
          </div>
        </div>
      </section>

      <KPIGrid isLoading={isLoading} metrics={metrics} />

      <FilterBar>
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-white/10 bg-[#0c1120] px-3">
          <Search className="size-4 text-zinc-400" />
          <input
            aria-label="Filtrar contas por nome"
            className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none
