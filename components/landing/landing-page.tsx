import {
  ArrowRight,
  BrainCircuit,
  GitBranch,
  MessageSquareText,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const problemSignals = [
  "Feedback negativo",
  "Onboarding atrasado",
  "Acessos negados",
  "Baixa adoção",
  "Benchmark abaixo do mercado",
  "Tendência emergente",
  "Churn Risk",
  "Oportunidade de expansão",
];

const intelligenceContexts = ["Operação", "Cliente", "Risco", "Mercado"];

const decisionSteps = [
  { icon: GitBranch, title: "Sinais" },
  { icon: BrainCircuit, title: "Contexto" },
  { icon: Sparkles, title: "Insights" },
  { icon: Target, title: "Recomendações" },
  { icon: ArrowRight, title: "Decisão" },
];

const valueCards = [
  {
    icon: GitBranch,
    text: "Identifique riscos antes que virem problemas.",
    title: "Menos reação",
  },
  {
    icon: BrainCircuit,
    text: "Conecte operação, cliente, risco e mercado.",
    title: "Mais contexto",
  },
  {
    icon: Target,
    text: "Priorize ações com base em evidências.",
    title: "Melhor decisão",
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
            <a className="hover:text-zinc-950" href="#decisao">
              Decisão
            </a>
            <a className="hover:text-zinc-950" href="#valor">
              Valor
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
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-end px-4 pb-14 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Sparkles className="size-4" />
              KV Partners
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              Product Intelligence Ecosystem
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-medium leading-8 text-zinc-200">
              Dados mostram o que aconteceu.
              <br />
              Inteligência explica por quê.
              <br />
              IA sugere o que fazer.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
              Transforme sinais operacionais, feedbacks, riscos e tendências
              de mercado em decisões estratégicas orientadas por evidências.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-white text-zinc-950 hover:bg-zinc-200",
                )}
                href="#decisao"
              >
                Explorar Ecossistema
                <ArrowRight className="size-4" />
              </a>
              <Link
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white",
                )}
                href="/executive-center"
              >
                Ver Demonstração
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
        id="problema"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-zinc-500">O problema</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Toda empresa possui sinais.
            <br />
            Poucas conseguem transformá-los em decisões.
          </h2>
        </div>

        <div className="mx-auto mt-9 max-w-5xl rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {problemSignals.map((signal, index) => (
              <div
                className={cn(
                  "rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white",
                  index % 3 === 1 && "sm:translate-y-3",
                  index % 4 === 2 && "lg:-translate-y-2",
                )}
                key={signal}
              >
                {signal}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-y border-zinc-200 bg-white px-4 py-14 sm:px-6 lg:px-8"
        id="contexto"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-zinc-500">Contexto</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              O problema não é enxergar os sinais.
              <span className="mt-2 block text-zinc-500">
                O problema é conectar o contexto.
              </span>
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-600">
              Quando sinais permanecem isolados, as decisões dependem de
              percepção.
              <br />
              Quando sinais são conectados, eles se transformam em
              inteligência.
            </p>
          </div>

          <div className="relative mx-auto grid min-h-[360px] w-full max-w-2xl place-items-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_42%)]" />
            <div className="absolute h-px w-[72%] bg-white/10" />
            <div className="absolute h-[72%] w-px bg-white/10" />
            <div className="relative z-10 grid size-40 place-items-center rounded-full border border-white/15 bg-white text-center text-sm font-semibold uppercase tracking-[0.14em] text-zinc-950 shadow-2xl">
              INTELLIGENCE
              <br />
              ENGINE
            </div>
            <div className="absolute inset-5">
              {intelligenceContexts.map((context, index) => (
                <div
                  className={cn(
                    "absolute rounded-lg border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-zinc-100 shadow-lg backdrop-blur",
                    index === 0 && "left-1/2 top-0 -translate-x-1/2",
                    index === 1 && "right-0 top-1/2 -translate-y-1/2",
                    index === 2 && "bottom-0 left-1/2 -translate-x-1/2",
                    index === 3 && "left-0 top-1/2 -translate-y-1/2",
                  )}
                  key={context}
                >
                  {context}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8" id="decisao">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-zinc-500">Jornada</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Da informação à decisão.
          </h2>
        </div>

        <div className="mt-9 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {decisionSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div className="contents" key={step.title}>
                  <div className="group rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-center transition hover:-translate-y-1 hover:border-zinc-300 hover:bg-white hover:shadow-sm">
                    <Icon className="mx-auto size-5 text-zinc-950" />
                    <p className="mt-3 text-sm font-semibold text-zinc-950">
                      {step.title}
                    </p>
                  </div>
                  {index < decisionSteps.length - 1 ? (
                    <div className="flex justify-center text-zinc-400">
                      <ArrowRight className="hidden size-5 md:block" />
                      <div className="h-5 w-px bg-zinc-200 md:hidden" />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="border-y border-zinc-200 bg-white px-4 py-14 sm:px-6 lg:px-8"
        id="valor"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
          <p className="text-sm font-medium text-zinc-500">Valor gerado</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            O resultado não é um dashboard.
            <span className="mt-2 block text-zinc-500">
              É clareza para decidir.
            </span>
          </h2>
          </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {valueCards.map((item) => {
            const Icon = item.icon;

            return (
              <article
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
                key={item.title}
              >
                <Icon className="size-5 text-zinc-950" />
                <h3 className="mt-6 text-xl font-semibold text-zinc-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {item.text}
                </p>
              </article>
            );
          })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-8 text-white shadow-sm sm:p-10">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            A próxima decisão não deveria depender de opinião.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            Transforme sinais operacionais em inteligência estratégica.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
            <Link
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white",
              )}
              href="/executive-center"
            >
              Explorar Plataforma
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroScene() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute right-[-120px] top-20 hidden w-[760px] rotate-[-4deg] lg:block">
        <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4 shadow-2xl">
          <div className="grid gap-3 md:grid-cols-3">
            {["Health Score", "Risk Score", "Opportunity Score"].map(
              (label, index) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.08] p-4"
                  key={label}
                >
                  <p className="text-xs text-zinc-400">{label}</p>
                  <p className="mt-3 text-3xl font-semibold">
                    {[84, 37, 91][index]}
                  </p>
                </div>
              ),
            )}
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-zinc-950/40">
            {["Grupo Orion", "Clínica Alfa", "Educa Prime", "TechFlow"].map(
              (account, index) => (
                <div
                  className="grid grid-cols-[1fr_90px_90px] border-b border-white/10 px-4 py-3 text-sm last:border-b-0"
                  key={account}
                >
                  <span>{account}</span>
                  <span className="text-zinc-300">
                    {[92, 71, 66, 88][index]}
                  </span>
                  <span className="text-zinc-300">
                    {[18, 54, 61, 22][index]}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-10 right-8 hidden w-80 rounded-lg border border-white/10 bg-white/[0.08] p-4 shadow-2xl md:block">
        <div className="flex items-center gap-2">
          <MessageSquareText className="size-4 text-zinc-300" />
          <p className="text-sm font-semibold text-white">AI Copilot</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Recomendação: priorizar onboarding inicial e reduzir fricção de
          permissões nas contas em risco.
        </p>
      </div>
    </div>
  );
}
