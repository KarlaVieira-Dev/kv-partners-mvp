import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function WorkspacePlaceholder({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-7xl">
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <Sparkles className="size-4 text-zinc-950" />
              Espaco de Inteligencia de Produto
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Esta area ja esta conectada a navegacao e pronta para a proxima
              etapa do MVP.
            </p>
          </div>
          <Link className={buttonVariants({ variant: "outline" })} href="/">
            <ArrowLeft className="size-4" />
            Centro Executivo
          </Link>
        </div>
      </section>
    </div>
  );
}
