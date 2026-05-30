import {
  ArrowRight,
  BrainCircuit,
  Check,
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

const scatteredSignals = [
  "Feedback negativo",
  "Onboarding atrasado",
  "Baixa adoção",
  "Benchmark abaixo do mercado",
  "Churn Risk",
  "Acessos negados",
];

const intelligenceOrbit = ["Contexto", "Padrões", "Insights", "IA"];

const orientedDecisions = [
  "Prioridade identificada",
  "Risco antecipado",
  "Oportunidade detectada",
  "Recomendação gerada",
  "Próxima ação sugerida",
];

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
    text: "Identifique riscos antes do impacto.",
    title: "Antecipe problemas",
  },
  {
    icon: BrainCircuit,
    text: "Una operação, cliente, risco e mercado.",
    title: "Conecte contexto",
  },
  {
    icon: Target,
    text: "Decida com base em evidências.",
    title: "Priorize melhor",
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
              Os dados já existem.
              <br />
              As decisões ainda dependem de opinião.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
              Transforme sinais operacionais, feedbacks, riscos e tendências
              de mercado em inteligência estratégica orientada por contexto.
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
            Toda empresa possui dados.
            <br />
            Poucas conseguem transformá-los em vantagem competitiva.
          </h2>
          <p className="mt-5 text-base leading-7 text-zinc-600">
            Todos os dias sua operação gera sinais.
            <br />
            Feedbacks. Jornadas. Riscos. Mercado.
            <br />
            O problema não é a falta de informação.
            <br />
            É a dificuldade de conectar contexto suficiente para tomar decisões
            melhores.
          </p>
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
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium text-zinc-500">Transformação</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Como sinais se transformam em decisões.
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-600">
              Transformamos informações dispersas em contexto acionável.
            </p>
          </div>

          <div className="mt-9 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950 text-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1fr_0.9fr_1fr]">
              <div className="border-b border-white/10 bg-white/[0.03] p-5 lg:border-b-0 lg:border-r">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Antes
                </p>
                <h3 className="mt-3 text-xl font-semibold text-zinc-100">
                  Sinais dispersos
                </h3>
                <div className="relative mt-6 min-h-[220px] rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  {scatteredSignals.map((signal, index) => (
                    <span
                      className={cn(
                        "absolute max-w-[160px] rounded-md border border-white/10 bg-zinc-800/80 px-3 py-2 text-xs font-medium text-zinc-300 shadow-sm",
                        index === 0 && "left-4 top-5 rotate-[-3deg]",
                        index === 1 && "right-5 top-10 rotate-2",
                        index === 2 && "left-8 top-24 rotate-1",
                        index === 3 && "right-3 top-28 rotate-[-2deg]",
                        index === 4 && "bottom-6 left-5 rotate-2",
                        index === 5 && "bottom-10 right-8 rotate-[-3deg]",
                      )}
                      key={signal}
                    >
                      {signal}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-base font-medium leading-7 text-zinc-300">
                  Informação existe.
                  <br />
                  Contexto não.
                </p>
              </div>

              <div className="relative grid min-h-[360px] place-items-center overflow-hidden border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_48%)]" />
                <div className="absolute left-8 right-8 top-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute bottom-8 top-8 left-1/2 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <div className="relative grid size-44 place-items-center rounded-full border border-white/15 bg-white text-center text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950 shadow-2xl">
                  INTELLIGENCE
                </div>
                {intelligenceOrbit.map((item, index) => (
                  <div
                    className={cn(
                      "absolute rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-zinc-200 shadow-lg backdrop-blur-sm",
                      index === 0 && "left-1/2 top-8 -translate-x-1/2",
                      index === 1 && "right-8 top-1/2 -translate-y-1/2",
                      index === 2 && "bottom-8 left-1/2 -translate-x-1/2",
                      index === 3 && "left-8 top-1/2 -translate-y-1/2",
                    )}
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="bg-white p-5 text-zinc-950">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Depois
                </p>
                <h3 className="mt-3 text-xl font-semibold text-zinc-950">
                  Decisão orientada
                </h3>
                <div className="mt-6 grid gap-3">
                  {orientedDecisions.map((decision) => (
                    <div
                      className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700"
                      key={decision}
                    >
                      <Check className="size-4 text-emerald-600" />
                      <span>{decision}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-base font-medium leading-7 text-zinc-700">
                  Menos opinião.
                  <br />
                  Mais evidência.
                </p>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-xl font-semibold leading-8 text-zinc-950">
            Dados mostram o que aconteceu.
            <br />
            Contexto explica por quê.
            <br />
            Inteligência sugere o que fazer.
          </p>
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
