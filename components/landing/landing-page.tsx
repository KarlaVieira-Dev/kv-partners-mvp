import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const transformation = ["sinais dispersos", "contexto", "inteligência", "decisão"];

const signals = ["feedbacks", "comportamentos", "riscos", "mudanças de mercado"];

const outcomes = [
  "riscos percebidos antes do impacto",
  "oportunidades vistas antes da concorrência",
  "decisões apoiadas por contexto",
  "menos opinião, mais evidência",
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
            <a className="hover:text-zinc-950" href="#sinais">
              Sinais
            </a>
            <a className="hover:text-zinc-950" href="#virada">
              Virada
            </a>
            <a className="hover:text-zinc-950" href="#decisao">
              Decidir
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
        <div className="relative mx-auto flex min-h-[690px] max-w-7xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Sparkles className="size-4" />
              Product Intelligence Ecosystem
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
              Os sinais aparecem antes dos problemas.
            </h1>
            <p className="mt-7 max-w-2xl text-xl font-medium leading-8 text-zinc-200">
              A diferença está em quem consegue enxergá-los.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
              Uma forma mais estratégica de transformar sinais operacionais em
              contexto, clareza e decisão.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-white text-zinc-950 hover:bg-zinc-200",
                )}
                href="/executive-center"
              >
                Ver Demonstração
                <ArrowRight className="size-4" />
              </Link>
              <a
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white",
                )}
                href="#sinais"
              >
                Entender a visão
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        id="sinais"
      >
        <div className="max-w-5xl">
          <h2 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            Sua empresa já possui os sinais.
          </h2>
          <p className="mt-6 max-w-3xl text-2xl font-medium leading-9 text-zinc-500">
            O problema é perceber tarde demais o que eles estavam tentando
            dizer.
          </p>
        </div>
        <div className="mt-12 grid gap-8 border-t border-zinc-200 pt-8 lg:grid-cols-[0.8fr_1.2fr]">
          <p className="text-base leading-7 text-zinc-500">
            Feedbacks. Comportamentos. Riscos. Mudanças de mercado.
          </p>
          <p className="max-w-2xl text-xl font-medium leading-8 text-zinc-800">
            Todos os dias sua operação produz sinais. Poucas empresas conseguem
            transformá-los em vantagem competitiva.
          </p>
        </div>
      </section>

      <section
        className="border-y border-zinc-200 bg-white px-4 py-20 sm:px-6 lg:px-8"
        id="virada"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
              Pare de descobrir problemas quando já é tarde.
            </h2>
            <p className="mt-6 max-w-2xl text-xl font-medium leading-8 text-zinc-500">
              Transformamos sinais dispersos em contexto para apoiar decisões
              melhores.
            </p>
          </div>

          <div className="mt-14 overflow-hidden rounded-lg bg-zinc-950 px-5 py-10 text-white sm:px-8 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.2fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Antes
                </p>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-zinc-100">
                  Ruído.
                </p>
                <p className="mt-4 max-w-xs text-base leading-7 text-zinc-400">
                  Informação existe. Contexto não.
                </p>
              </div>

              <div className="relative min-h-[260px]">
                <div className="absolute inset-y-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="absolute left-1/2 top-1/2 grid size-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white text-center text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950 shadow-2xl">
                  Inteligência
                </div>
                {transformation.map((item, index) => (
                  <span
                    className={cn(
                      "absolute text-xs font-medium uppercase tracking-[0.14em] text-zinc-500",
                      index === 0 && "left-0 top-6",
                      index === 1 && "left-1/2 top-0 -translate-x-1/2",
                      index === 2 && "bottom-0 left-1/2 -translate-x-1/2",
                      index === 3 && "right-0 top-6",
                    )}
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="lg:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Depois
                </p>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  Clareza.
                </p>
                <p className="mt-4 max-w-xs text-base leading-7 text-zinc-400 lg:ml-auto">
                  Menos reação. Mais decisão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        id="decisao"
      >
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
              Antecipe riscos antes que eles virem resultados.
            </h2>
            <p className="mt-6 max-w-2xl text-xl font-medium leading-8 text-zinc-500">
              O futuro raramente chega sem avisar.
            </p>
            <p className="mt-8 max-w-2xl text-base leading-7 text-zinc-600">
              Os sinais aparecem antes dos problemas. A diferença está em quem
              consegue enxergá-los.
            </p>
          </div>

          <div className="space-y-5 pt-2">
            {outcomes.map((outcome) => (
              <p
                className="border-t border-zinc-200 pt-5 text-lg font-medium leading-7 text-zinc-800"
                key={outcome}
              >
                {outcome}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="border-t border-zinc-200 pt-14">
          <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            Decida antes que o mercado decida por você.
          </h2>
          <p className="mt-6 max-w-2xl text-xl font-medium leading-8 text-zinc-500">
            Veja como sinais operacionais podem ser transformados em
            inteligência estratégica.
          </p>
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

function HeroScene() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute right-[-18%] top-[-12%] h-[680px] w-[680px] rounded-full border border-white/10 bg-white/[0.03]" />
      <div className="absolute right-[8%] top-24 hidden w-[520px] lg:block">
        <div className="relative h-[420px]">
          <div className="absolute left-0 top-10 h-px w-full rotate-[-12deg] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="absolute left-8 top-40 h-px w-full rotate-[8deg] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute left-16 top-72 h-px w-full rotate-[-4deg] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          {signals.map((signal, index) => (
            <span
              className={cn(
                "absolute text-sm font-medium text-zinc-500",
                index === 0 && "left-0 top-0",
                index === 1 && "right-16 top-24",
                index === 2 && "left-24 top-56",
                index === 3 && "right-0 bottom-8",
              )}
              key={signal}
            >
              {signal}
            </span>
          ))}
          <div className="absolute right-28 top-36 grid size-40 place-items-center rounded-full bg-white text-center text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950 shadow-2xl">
            clareza
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
    </div>
  );
}
