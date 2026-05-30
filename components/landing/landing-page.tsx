import {
  ArrowRight,
  BrainCircuit,
  GitBranch,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const problemCards = [
  {
    title: "Dados Isolados",
    text: "Onboarding, feedbacks, métricas e mercado vivem em sistemas diferentes.",
  },
  {
    title: "Contexto Perdido",
    text: "Sinais importantes existem, mas raramente são conectados.",
  },
  {
    title: "Decisões Reativas",
    text: "Problemas normalmente são identificados apenas depois do impacto.",
  },
];

const flowSteps = [
  "Contas",
  "Onboarding",
  "Feedback Intelligence",
  "Identity & Onboarding Intelligence",
  "Market & Growth Intelligence",
  "AI Copilot",
  "Decisão",
];

const differentiators = [
  {
    icon: GitBranch,
    title: "Dados Operacionais",
    text: "Eventos, jornadas e comportamento operacional.",
  },
  {
    icon: MessageSquareText,
    title: "Voz do Cliente",
    text: "Feedbacks estruturados, temas e sentimentos.",
  },
  {
    icon: BrainCircuit,
    title: "Inteligência Preditiva",
    text: "Identificação antecipada de riscos e oportunidades.",
  },
  {
    icon: Sparkles,
    title: "IA Aplicada",
    text: "Recomendações executivas orientadas por contexto.",
  },
];

const platformCenters = [
  {
    href: "/executive-center",
    title: "Centro Executivo",
    text: "Visão consolidada do negócio.",
  },
  {
    href: "/onboarding-center",
    title: "Centro de Onboarding",
    text: "Acompanhamento operacional.",
  },
  {
    href: "/feedback-center",
    title: "Centro de Feedbacks",
    text: "Voz do cliente.",
  },
  {
    href: "/risk-center",
    title: "Centro de Riscos",
    text: "Predição e monitoramento.",
  },
  {
    href: "/growth-center",
    title: "Centro de Crescimento",
    text: "Mercado, JTBD e benchmarks.",
  },
  {
    href: "/ai-copilot",
    title: "AI Copilot",
    text: "Assistente executivo baseado em dados.",
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
            <a className="hover:text-zinc-950" href="#estrategia">
              Estratégia
            </a>
            <a className="hover:text-zinc-950" href="#demonstracao">
              Demonstração
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
                href="#estrategia"
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

      <Section
        description="Empresas investem em sistemas, dashboards e indicadores. Mesmo assim, decisões importantes continuam sendo tomadas sem uma visão conectada do negócio."
        id="problema"
        title={
          <>
            As empresas possuem dados.
            <br />
            Mas não possuem contexto.
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {problemCards.map((card) => (
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
        <ImpactStatement
          lines={["Coletar dados não gera valor.", "Tomar decisões melhores gera."]}
        />
      </Section>

      <Section
        description="Cada camada gera sinais que enriquecem a próxima etapa até chegar à tomada de decisão."
        id="estrategia"
        title="Da operação à estratégia."
      >
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="hidden items-center gap-2 lg:flex">
            {flowSteps.map((step, index) => (
              <div className="flex flex-1 items-center gap-2" key={step}>
                <div className="flex min-h-24 flex-1 flex-col justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <span className="text-xs font-medium text-zinc-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold leading-5 text-zinc-950">
                    {step}
                  </span>
                </div>
                {index < flowSteps.length - 1 ? (
                  <ArrowRight className="size-4 shrink-0 text-zinc-400" />
                ) : null}
              </div>
            ))}
          </div>

          <div className="space-y-3 lg:hidden">
            {flowSteps.map((step, index) => (
              <div className="flex gap-3" key={step}>
                <div className="flex flex-col items-center">
                  <span className="flex size-8 items-center justify-center rounded-md bg-zinc-950 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  {index < flowSteps.length - 1 ? (
                    <span className="h-7 w-px bg-zinc-200" />
                  ) : null}
                </div>
                <div className="min-h-10 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-950">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        description="Separados, esses sinais possuem pouco valor. Conectados, eles se tornam inteligência."
        title="Por que este ecossistema é diferente?"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {differentiators.map((item) => {
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
        <ImpactStatement
          lines={[
            "Dados mostram o que aconteceu.",
            "Inteligência explica por quê.",
            "IA sugere o que fazer.",
          ]}
        />
      </Section>

      <Section
        description="Acesse os centros operacionais para ver como os sinais são consolidados em uma experiência de Product Intelligence."
        id="demonstracao"
        title="Explore a Plataforma"
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {platformCenters.map((center) => (
            <Link
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
              href={center.href}
              key={center.title}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-950">
                    {center.title}
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-zinc-600">
                    {center.text}
                  </p>
                </div>
                <ArrowRight className="size-4 text-zinc-500" />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm leading-6 text-zinc-600">
            Projeto desenvolvido por Karla Vieira. Senior Product Manager com
            experiência em plataformas B2B, onboarding, identidade, governança,
            compliance e produtos orientados a dados.
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            O Product Intelligence Ecosystem foi criado para demonstrar uma
            visão integrada de Product Intelligence, conectando operações,
            feedbacks, riscos, mercado e inteligência artificial em uma única
            experiência.
          </p>
        </div>
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
          <Link
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-7 bg-white text-zinc-950 hover:bg-zinc-200",
            )}
            href="/executive-center"
          >
            Acessar Demonstração
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Section({
  children,
  description,
  id,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  id?: string;
  title: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" id={id}>
      <div className="mb-6 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-base leading-7 text-zinc-600">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ImpactStatement({ lines }: { lines: string[] }) {
  return (
    <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm">
      {lines.map((line) => (
        <p className="text-lg font-semibold leading-7 text-zinc-100" key={line}>
          {line}
        </p>
      ))}
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
        <p className="text-sm font-semibold text-white">AI Copilot</p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Recomendação: priorizar onboarding inicial e reduzir fricção de
          permissões nas contas em risco.
        </p>
      </div>
    </div>
  );
}
