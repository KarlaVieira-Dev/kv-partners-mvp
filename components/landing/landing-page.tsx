import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const resultCards = [
  {
    title: "Menos Risco",
    text: "Antecipe problemas antes que eles gerem impacto.",
  },
  {
    title: "Mais Retenção",
    text: "Identifique sinais de abandono antes que o cliente saia.",
  },
  {
    title: "Mais Crescimento",
    text: "Descubra oportunidades antes dos concorrentes.",
  },
  {
    title: "Mais Vantagem Competitiva",
    text: "Decida com contexto enquanto outros ainda reagem.",
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white">
              KV
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-950">
                KV Partners
              </p>
              <p className="text-xs text-zinc-500">
                Product Intelligence Ecosystem
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-zinc-600 md:flex">
            <a className="hover:text-zinc-950" href="#problema">
              Problema
            </a>
            <a className="hover:text-zinc-950" href="#transformacao">
              Transformação
            </a>
            <a className="hover:text-zinc-950" href="#resultado">
              Resultado
            </a>
            <Link
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href="/executive-center"
            >
              Ver Demonstração
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <HeroScene />
        <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-end px-4 pb-14 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
              Os sinais aparecem antes dos problemas.
            </h1>
            <p className="mt-7 max-w-2xl text-xl font-medium leading-8 text-zinc-300">
              Transforme sinais dispersos em inteligência estratégica capaz de
              antecipar riscos, oportunidades e prioridades.
            </p>
            <Link
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-9 bg-white text-zinc-950 hover:bg-zinc-200",
              )}
              href="/executive-center"
            >
              Ver Demonstração
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
        id="problema"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            Toda empresa possui dados.
            <br />
            <span className="text-zinc-500">
              Poucas conseguem transformá-los em vantagem competitiva.
            </span>
          </h2>
          <p className="mt-7 text-xl font-medium leading-8 text-zinc-600">
            Os dados já existem.
            <br />
            As decisões ainda dependem de opinião.
          </p>
        </div>
      </section>

      <section
        className="border-y border-zinc-200 bg-white px-4 py-14 sm:px-6 lg:px-8"
        id="transformacao"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
              Transformamos sinais em contexto.
            </h2>
            <p className="mt-6 max-w-3xl text-xl font-medium leading-8 text-zinc-500">
              A diferença não está na quantidade de informação. Está na
              capacidade de conectar padrões, riscos, comportamentos e
              oportunidades antes que gerem impacto.
            </p>
          </div>

          <div className="mt-10 rounded-lg bg-zinc-950 px-5 py-8 text-white sm:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
              <Stage label="Antes" title="Sinais" tone="muted" />
              <Arrow />
              <Stage label="Virada" title="Inteligência" tone="strong" />
              <Arrow />
              <Stage label="Depois" title="Decisão" tone="light" />
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
        id="resultado"
      >
        <div className="mb-8 max-w-4xl">
          <h2 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            Quando as decisões melhoram, os resultados mudam.
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {resultCards.map((card) => (
            <article
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
              key={card.title}
            >
              <h3 className="text-base font-semibold text-zinc-950">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {card.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="border-t border-zinc-200 pt-12">
          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            Os sinais já existem.
            <br />
            <span className="text-zinc-500">
              A diferença está em quem consegue transformá-los em decisão.
            </span>
          </h2>
          <Link
            className={cn(buttonVariants({ size: "lg" }), "mt-9")}
            href="/executive-center"
          >
            Ver Demonstração
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Stage({
  label,
  title,
  tone,
}: {
  label: string;
  title: string;
  tone: "light" | "muted" | "strong";
}) {
  const toneClasses = {
    light: "bg-white text-zinc-950",
    muted: "bg-white/[0.06] text-zinc-100",
    strong: "bg-white text-zinc-950 shadow-2xl",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 px-5 py-6 text-center",
        toneClasses[tone],
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-50">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{title}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center text-zinc-500">
      <ArrowRight className="hidden size-5 lg:block" />
      <div className="h-5 w-px bg-white/20 lg:hidden" />
    </div>
  );
}

function HeroScene() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute right-[-18%] top-[-22%] h-[620px] w-[620px] rounded-full border border-white/10 bg-white/[0.035]" />
      <div className="absolute right-[12%] top-28 hidden h-72 w-72 rounded-full border border-white/10 bg-white text-zinc-950 shadow-2xl lg:grid lg:place-items-center">
        <span className="text-sm font-semibold uppercase tracking-[0.18em]">
          Decisão
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
    </div>
  );
}
