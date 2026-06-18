import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const heroSignals = [
  "feedbacks",
  "comportamentos",
  "operação",
  "mercado",
  "suporte",
  "vendas",
];

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
    <main className="min-h-screen bg-[#f7f7f5] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050810]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#2563eb] text-sm font-semibold text-white">
              KV
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                KV Partners
              </p>
              <p className="text-xs text-zinc-400">
                Product Intelligence Ecosystem
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-zinc-400 md:flex">
            <a className="hover:text-white" href="#problema">
              Problema
            </a>
            <a className="hover:text-white" href="#transformacao">
              Transformação
            </a>
            <a className="hover:text-white" href="#resultado">
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

      <section className="relative overflow-hidden bg-[#2563eb] text-white">
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
                "mt-9 bg-[#050810] text-white hover:bg-zinc-200",
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
        className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8"
        id="problema"
      >
        <h2 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Toda empresa possui dados.
          <br />
          <span className="text-zinc-400">
            Poucas conseguem transformá-los em vantagem competitiva.
          </span>
        </h2>
        <p className="mx-auto mt-7 max-w-2xl text-xl font-medium leading-8 text-zinc-400">
          Os dados já existem.
          <br />
          As decisões ainda dependem de opinião.
        </p>
      </section>

      <section
        className="border-y border-white/10 bg-[#050810] px-4 py-14 text-center sm:px-6 lg:px-8"
        id="transformacao"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Transformamos sinais em contexto.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl font-medium leading-8 text-zinc-400">
            A diferença não está na quantidade de informação. Está na capacidade
            de conectar padrões, riscos, comportamentos e oportunidades antes
            que gerem impacto.
          </p>

          <div className="mx-auto mt-10 max-w-5xl rounded-lg bg-[#2563eb] px-5 py-8 text-white sm:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
              <Stage title="Sinais dispersos" />
              <Arrow />
              <Stage title="Inteligência e contexto" highlight />
              <Arrow />
              <Stage title="Decisões melhores" />
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-2xl font-semibold leading-9 text-white">
            As melhores decisões raramente surgem de mais dados.
            <br />
            <span className="text-zinc-400">Elas surgem de mais contexto.</span>
          </p>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8"
        id="resultado"
      >
        <h2 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Quando as decisões melhoram, os resultados mudam.
        </h2>

        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {resultCards.map((card) => (
            <article
              className="rounded-lg border border-white/10 bg-[#050810] p-5 text-left shadow-sm"
              key={card.title}
            >
              <h3 className="text-base font-semibold text-white">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {card.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#2563eb] px-4 py-16 text-center text-white sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Os sinais já existem.
          <br />
          <span className="text-zinc-400">
            A diferença está em quem consegue transformá-los em decisão.
          </span>
        </h2>
        <Link
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-9 bg-[#050810] text-white hover:bg-zinc-200",
          )}
          href="/executive-center"
        >
          Ver Demonstração
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}

function Stage({
  highlight = false,
  title,
}: {
  highlight?: boolean;
  title: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 px-5 py-6 text-center",
        highlight ? "bg-[#050810] text-white shadow-2xl" : "bg-[#050810]/[0.06]",
      )}
    >
      <p className="text-2xl font-semibold tracking-tight">{title}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center text-zinc-400">
      <ArrowRight className="hidden size-5 lg:block" />
      <div className="h-5 w-px bg-[#050810]/20 lg:hidden" />
    </div>
  );
}

function HeroScene() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 bg-[#2563eb]" />
      <div className="absolute right-[-18%] top-[-22%] h-[620px] w-[620px] rounded-full border border-white/10 bg-[#050810]/[0.035]" />
      <div className="absolute right-[3%] top-24 hidden h-[360px] w-[620px] lg:block">
        <div className="absolute inset-y-0 left-[42%] w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute left-[41%] top-1/2 h-px w-[38%] bg-gradient-to-r from-white/25 via-white/20 to-transparent" />
        <div className="absolute right-0 top-1/2 h-px w-[18%] bg-gradient-to-r from-white/25 to-transparent" />

        {heroSignals.map((signal, index) => (
          <div
            className={cn(
              "absolute flex items-center gap-3 text-sm font-medium text-zinc-400",
              index === 0 && "left-0 top-4",
              index === 1 && "left-7 top-20",
              index === 2 && "left-2 top-36",
              index === 3 && "left-12 top-52",
              index === 4 && "left-0 top-68",
              index === 5 && "left-20 top-80",
            )}
            key={signal}
          >
            <span>{signal}</span>
            <span className="h-px w-24 bg-gradient-to-r from-white/20 to-transparent" />
          </div>
        ))}

        <div className="absolute left-[32%] top-[38%] grid size-32 place-items-center rounded-full border border-white/10 bg-[#050810] text-center text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-2xl">
          Contexto
        </div>
        <div className="absolute right-0 top-[40%] grid size-28 place-items-center rounded-full border border-white/10 bg-[#050810]/[0.08] text-center text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
          Decisão
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
    </div>
  );
}
