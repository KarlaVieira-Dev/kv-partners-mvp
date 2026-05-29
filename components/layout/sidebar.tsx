"use client";

import {
  BarChart3,
  Bot,
  Building2,
  CircleGauge,
  MessageSquareText,
  Rocket,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/data/executive-center";
import { cn } from "@/lib/utils";

const icons = [
  CircleGauge,
  Building2,
  Rocket,
  MessageSquareText,
  ShieldAlert,
  BarChart3,
  Bot,
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-white/90 px-4 py-5 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white">
            KV
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-950">KV Partners</p>
            <p className="text-xs text-zinc-500">Product Intelligence</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = icons[index];
            const active = pathname === item.href;

            return (
              <Link
                className={cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                  active
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                )}
                href={item.href}
                key={item.label}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            MVP Status
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-950">
            Foundation ready
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Mock data is powering the first executive workspace.
          </p>
        </div>
      </div>
    </aside>
  );
}
