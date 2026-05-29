import { Bell, Search, UserCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { navigationItems } from "@/data/executive-center";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
          <Search className="size-4 text-zinc-400" />
          <input
            aria-label="Search"
            className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
            placeholder="Search accounts, signals, risks..."
            type="search"
          />
        </div>

        <Button aria-label="Notifications" size="icon" variant="outline">
          <Bell className="size-4" />
        </Button>
        <Button
          aria-label="Profile"
          className="hidden sm:inline-flex"
          size="icon"
          variant="outline"
        >
          <UserCircle className="size-4" />
        </Button>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-zinc-200 px-4 py-2 lg:hidden">
        {navigationItems.map((item) => (
          <Link
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
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
