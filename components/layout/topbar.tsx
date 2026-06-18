import { Bell, Search, UserCircle } from "lucide-react";
import Link from "next/link";
import { navigationItems } from "@/data/executive-center";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050810]/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-white/10 bg-[#0c1120] px-3">
          <Search className="size-4 text-zinc-400" />
          <input
            aria-label="Buscar"
            className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-zinc-500"
            placeholder="Buscar contas, sinais e riscos..."
            type="search"
          />
        </div>
        <button
          aria-label="Notificações"
          className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-[#0c1120] text-zinc-400 transition hover:border-white/20 hover:text-white"
        >
          <Bell className="size-4" />
        </button>
        <button
          aria-label="Perfil"
          className="hidden sm:flex size-9 items-center justify-center rounded-lg border border-white/10 bg-[#0c1120] text-zinc-400 transition hover:border-white/20 hover:text-white"
        >
          <UserCircle className="size-4" />
        </button>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-2 lg:hidden">
        {navigationItems.map((item) => (
          <Link
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-[#111827] hover:text-white"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
