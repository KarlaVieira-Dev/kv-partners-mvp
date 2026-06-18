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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-[#050810]/90 px-4 py-5 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div
            className="flex size-9 items-center justify-center rounded-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)" }}
          >
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <path
                d="M4 14C4 14 8 7 14 7C20 7 24 14 24 14C24 14 20 21 14 21C8 21 4 14 4 14Z"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="14" cy="14" r="3.5" stroke="white" strokeWidth="1.8" />
              <circle cx="14" cy="14" r="1.2" fill="white" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">KV Partners</p>
            <p className="text-xs italic" style={{ color: "#a78bfa" }}>
              Intelligence Platform
            </p>
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
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "text-zinc-400 hover:bg-[#111827] hover:text-white",
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
        <div className="mt-auto rounded-lg border border-white/10 bg-[#0c1120] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
            Status do MVP
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            Fundação pronta
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            Dados reais do Google Sheets alimentam os módulos principais.
          </p>
        </div>
      </div>
    </aside>
  );
}
