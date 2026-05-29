"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  ExecutiveAccountRow,
  ExecutiveAccountsResponse,
} from "@/lib/google-sheets/types";
import { cn } from "@/lib/utils";

const scoreColor = (score: number) => {
  if (score >= 85) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (score >= 70) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-rose-50 text-rose-700";
};

const riskColor = (score: number) => {
  if (score >= 70) {
    return "bg-rose-50 text-rose-700";
  }

  if (score >= 50) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
};

const average = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  );
};

const uniqueOptions = (values: string[]) => [
  "All",
  ...Array.from(new Set(values.filter(Boolean))).sort(),
];

const isManagerAccount = (type: string) =>
  type.toLowerCase().includes("gestora");

const isManagedAccount = (type: string) =>
  type.toLowerCase().includes("gerenciada");

export function AccountsCenter() {
  const [accounts, setAccounts] = useState<ExecutiveAccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [segment, setSegment] = useState("All");
  const [status, setStatus] = useState("All");

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
      segments: uniqueOptions(
        accounts.map((account) => account.segment ?? ""),
      ),
      statuses: uniqueOptions(accounts.map((account) => account.status)),
      types: uniqueOptions(accounts.map((account) => account.type)),
    }),
    [accounts],
  );

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch = account.account
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesType = type === "All" || account.type === type;
      const matchesSegment =
        segment === "All" || account.segment === segment;
      const matchesStatus = status === "All" || account.status === status;

      return matchesSearch && matchesType && matchesSegment && matchesStatus;
    });
  }, [accounts, search, segment, status, type]);

  const metrics = useMemo(
    () => [
      {
        detail: "Base lida da aba 01_Contas",
        label: "Total de contas",
        value: accounts.length,
      },
      {
        detail: "Tipo de conta gestora",
        label: "Contas Gestoras",
        value: accounts.filter((account) => isManagerAccount(account.type))
          .length,
      },
      {
        detail: "Tipo de conta gerenciada",
        label: "Contas Gerenciadas",
        value: accounts.filter((account) => isManagedAccount(account.type))
          .length,
      },
      {
        detail: "Media do health_score",
        label: "Health Score medio",
        value: average(accounts.map((account) => account.healthScore)),
      },
    ],
    [accounts],
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Customer intelligence
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Accounts
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Monitor account portfolio health, commercial context, and
              lifecycle status across the ecosystem.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <SlidersHorizontal className="size-4 text-zinc-950" />
            {isLoading ? "Loading accounts" : `${filteredAccounts.length} accounts`}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
            <Search className="size-4 text-zinc-400" />
            <input
              aria-label="Filter accounts by name"
              className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search accounts..."
              type="search"
              value={search}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
            <FilterSelect
              label="Type"
              onChange={setType}
              options={filterOptions.types}
              value={type}
            />
            <FilterSelect
              label="Segment"
              onChange={setSegment}
              options={filterOptions.segments}
              value={segment}
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
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                <th className="px-5 py-3">Conta</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Segmento</th>
                <th className="px-5 py-3">Porte</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Health Score</th>
                <th className="px-5 py-3">Risk Score</th>
                <th className="px-5 py-3">Plano</th>
                <th className="px-5 py-3">Cidade</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredAccounts.map((account) => (
                <tr className="text-sm text-zinc-600" key={account.account}>
                  <td className="px-5 py-4">
                    <span className="font-medium text-zinc-950">
                      {account.account}
                    </span>
                  </td>
                  <td className="px-5 py-4">{account.type}</td>
                  <td className="px-5 py-4">{account.segment}</td>
                  <td className="px-5 py-4">{account.size}</td>
                  <td className="px-5 py-4">{account.status}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-medium",
                        scoreColor(account.healthScore),
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
                  <td className="px-5 py-4">{account.plan}</td>
                  <td className="px-5 py-4">{account.city}</td>
                  <td className="px-5 py-4">{account.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredAccounts.length === 0 && (
          <div className="border-t border-zinc-100 px-5 py-10 text-center text-sm text-zinc-500">
            No accounts match the selected filters.
          </div>
        )}
      </section>
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
