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
  "Dados espalhados",
  "Sinais sem conexão",
  "Decisões reativas",
];

const signalSources = [
  "Sinais Operacionais",
  "Voz do Cliente",
  "Riscos",
  "Mercado",
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
        className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8"
        id="problema"
      >
        <div>
          <p className="text-sm font-medium text-zinc-500">O problema</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            As empresas possuem dados.
            <br />
            Mas ainda tomam decisões no escuro.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">
            Onboarding, feedbacks, riscos e mercado geram sinais todos os dias.
            Quando esses sinais ficam desconectados, decisões importantes
            continuam dependendo de percepção.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xl font-semibold leading-8 text-zinc-950">
            O problema não é falta de dados.
            <br />
            É falta de contexto.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {problemSignals.map((signal) => (
              <div
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700"
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
        id="decisao"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-zinc-500">Inteligência</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Do sinal à decisão.
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-600">
              O ecossistema conecta sinais operacionais, voz do cliente, riscos
              e mercado para gerar inteligência acionável.
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-950 p-4 text-white shadow-sm sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_0.55fr_auto_0.55fr_auto_0.55fr] lg:items-center">
              <div className="grid gap-2 sm:grid-cols-2">
                {signalSources.map((source) => (
                  <div
                    className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-zinc-100"
                    key={source}
                  >
                    {source}
                  </div>
                ))}
              </div>
              <FlowArrow />
              <FlowNode label="Inteligência" tone="light" />
              <FlowArrow />
              <FlowNode label="AI Copilot" tone="accent" />
              <FlowArrow />
              <FlowNode label="Decisão" tone="final" />
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
        id="valor"
      >
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-zinc-500">Valor gerado</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            O valor aparece quando sinais viram decisão.
          </h2>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {valueCards.map((item) => {
            const Icon = item.icon;

            return (
              <article
                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                key={item.title}
              >
                <Icon className="size-5 text-zinc-950" />
                <h3 className="mt-4 text-base font-semibold text-zinc-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>

        <p className="mt-8 max-w-2xl text-xl font-semibold leading-8 text-zinc-950">
          Toda empresa possui dashboards.
          <br />
          Poucas conseguem transformar sinais em decisões.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-7 text-white shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            A próxima decisão não deveria depender de opinião.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
            Explore como sinais operacionais podem ser transformados em
            inteligência estratégica para apoiar decisões de produto.
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
              href="/ai-copilot"
            >
              Explorar AI Copilot
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FlowArrow() {
  return (
    <div className="flex justify-center text-zinc-500 lg:rotate-0">
      <ArrowRight className="hidden size-5 lg:block" />
      <div className="h-5 w-px bg-white/20 lg:hidden" />
    </div>
  );
}

function FlowNode({
  label,
  tone,
}: {
  label: string;
  tone: "accent" | "final" | "light";
}) {
  const toneClasses = {
    accent: "border-white/15 bg-white text-zinc-950",
    final: "border-emerald-300/30 bg-emerald-300/15 text-emerald-50",
    light: "border-white/10 bg-white/[0.08] text-white",
  };

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-4 text-center text-sm font-semibold",
        toneClasses[tone],
      )}
    >
      {label}
    </div>
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
