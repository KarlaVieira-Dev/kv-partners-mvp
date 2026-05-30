import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Building2,
  CheckCircle2,
  CircleGauge,
  GitBranch,
  LineChart,
  MessageSquareText,
  Rocket,
  ShieldAlert,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const problemCards = [
  {
    title: "Onboarding",
    text: "Não sabemos quais contas estão enfrentando dificuldades.",
  },
  {
    title: "Feedbacks",
    text: "Não sabemos quais problemas merecem prioridade.",
  },
  {
    title: "Operação",
    text: "Riscos são identificados apenas quando já causaram impacto.",
  },
  {
    title: "Mercado",
    text: "Decisões são tomadas sem considerar tendências e benchmarks.",
  },
  {
    title: "Liderança",
    text: "Executivos recebem indicadores, mas não recebem recomendações.",
  },
];

const flowSteps = [
  {
    title: "Contas",
    text: "Base de relacionamento, contexto comercial e status operacional.",
  },
  {
    title: "Onboarding",
    text: "Jornadas, progresso, prazos e sinais de ativação.",
  },
  {
    title: "Feedbacks",
    text: "Voz do cliente estruturada por tema, prioridade e sentimento.",
  },
  {
    title: "Identity & Onboarding Intelligence",
    text: "Camada analítica para risco, saúde, acesso e uso.",
  },
  {
    title: "Market & Growth Intelligence",
    text: "JTBD, tendências, concorrentes, benchmarks e recomendações.",
  },
  {
    title: "AI Copilot",
    text: "Assistente executivo que interpreta sinais e sugere decisões.",
  },
  {
    title: "Decisão",
    text: "Priorização orientada por evidências e contexto consolidado.",
  },
];

const ecosystemModules = [
  {
    href: "/onboarding-center",
    icon: Rocket,
    title: "Account Onboarding",
    text: "Centraliza onboarding, jornadas e ativação de contas.",
  },
  {
    href: "/feedback-center",
    icon: MessageSquareText,
    title: "Feedback Intelligence",
    text: "Transforma feedbacks em dados estruturados.",
  },
  {
    href: "/risk-center",
    icon: ShieldAlert,
    title: "Identity & Onboarding Intelligence",
    text: "Identifica riscos antes que se tornem problemas.",
  },
  {
    href: "/growth-center",
    icon: LineChart,
    title: "Market & Growth Intelligence",
    text: "Conecta comportamento, mercado e benchmarks.",
  },
  {
    href: "/ai-copilot",
    icon: Bot,
    title: "AI Copilot",
    text: "Traduz sinais complexos em recomendações executivas.",
  },
];

const differentiators = [
  {
    icon: GitBranch,
    title: "Dados Operacionais",
    text: "Eventos e jornadas.",
  },
  {
    icon: MessageSquareText,
    title: "Voz do Cliente",
    text: "Feedbacks estruturados.",
  },
  {
    icon: BrainCircuit,
    title: "Inteligência Preditiva",
    text: "Riscos e sinais antecipados.",
  },
  {
    icon: LineChart,
    title: "Inteligência de Mercado",
    text: "Tendências e benchmarks.",
  },
  {
    icon: Sparkles,
    title: "IA Aplicada",
    text: "Recomendações executivas.",
  },
  {
    icon: Target,
    title: "Decisão",
    text: "Ações orientadas por evidências.",
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
            <a className="hover:text-zinc-950" href="#ecossistema">
              Ecossistema
            </a>
            <a className="hover:text-zinc-950" href="#plataforma">
              Plataforma
            </a>
            <Link
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href="/executive-center"
            >
              Acessar Demonstração
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <HeroScene />
        <div className="relative mx-auto flex min-h-[680px] max-w-7xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Sparkles className="size-4" />
              KV Partners
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              Product Intelligence Ecosystem
            </h1>
            <p className="mt-5 text-xl font-medium text-zinc-200">
              Transformando sinais operacionais em decisões estratégicas.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
              Consolide onboarding, feedbacks, riscos, inteligência de mercado
              e IA em uma única plataforma capaz de identificar oportunidades,
              antecipar problemas e orientar decisões de produto.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-white text-zinc-950 hover:bg-zinc-200",
                )}
                href="#ecossistema"
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
                Acessar Demonstração
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Section id="problema" eyebrow="O Problema" title="As empresas possuem dados. Mas não possuem contexto.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
        <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm">
          <p className="text-lg font-semibold">
            Dados isolados explicam o passado.
          </p>
          <p className="mt-1 text-lg text-zinc-300">
            Inteligência conectada orienta o futuro.
          </p>
        </div>
      </Section>

      <Section title="Como o Ecossistema funciona">
        <div className="grid gap-3">
          {flowSteps.map((step, index) => (
            <div
              className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[180px_1fr]"
              key={step.title}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-md bg-zinc-950 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="text-sm font-semibold text-zinc-950">
                  {step.title}
                </h3>
              </div>
              <p className="text-sm leading-6 text-zinc-600">{step.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="ecossistema"
        eyebrow="Módulos"
        title="Módulos do Ecossistema"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {ecosystemModules.map((module) => {
            const Icon = module.icon;

            return (
              <article
                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                key={module.title}
              >
                <Icon className="size-5 text-zinc-950" />
                <h3 className="mt-4 text-base font-semibold text-zinc-950">
                  {module.title}
                </h3>
                <p className="mt-3 min-h-16 text-sm leading-6 text-zinc-600">
                  {module.text}
                </p>
                <Link
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-950"
                  href={module.href}
                >
                  Acessar módulo
                  <ArrowRight className="size-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </Section>

      <Section title="Mais do que dashboards">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </Section>

      <Section title="Arquitetura do Ecossistema">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <ArchitectureTree />
          </div>
          <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-base leading-7 text-zinc-600">
              Cada módulo produz sinais especializados que alimentam uma camada
              central de inteligência responsável por consolidar contexto,
              identificar riscos, gerar insights e recomendar ações.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="plataforma"
        eyebrow="Demonstração"
        title="Explore a Plataforma"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platformCenters.map((center) => (
            <Link
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
              href={center.href}
              key={center.title}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-zinc-950">
                    {center.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {center.text}
                  </p>
                </div>
                <ArrowRight className="size-4 text-zinc-500" />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Sobre o Projeto">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-base leading-7 text-zinc-600">
            Projeto desenvolvido por Karla Vieira.
          </p>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            Senior Product Manager com experiência em plataformas B2B,
            onboarding, identidade, governança, compliance e produtos
            orientados a dados.
          </p>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            O Product Intelligence Ecosystem foi criado para demonstrar uma
            visão integrada de Product Intelligence, conectando operações,
            feedbacks, riscos, mercado e inteligência artificial em uma única
            experiência.
          </p>
        </div>
      </Section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-8 text-white shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Pronto para explorar o ecossistema?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
            Conheça como sinais operacionais podem ser transformados em
            inteligência estratégica para apoiar decisões de produto.
          </p>
          <Link
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-7 bg-white text-zinc-950 hover:bg-zinc-200",
            )}
            href="/executive-center"
          >
            Acessar Centro Executivo
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Section({
  children,
  eyebrow,
  id,
  title,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  id?: string;
  title: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" id={id}>
      <div className="mb-6">
        {eyebrow ? (
          <p className="text-sm font-medium text-zinc-500">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
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
            {[
              "Grupo Orion",
              "Clínica Alfa",
              "Educa Prime",
              "TechFlow",
            ].map((account, index) => (
              <div
                className="grid grid-cols-[1fr_90px_90px] border-b border-white/10 px-4 py-3 text-sm last:border-b-0"
                key={account}
              >
                <span>{account}</span>
                <span className="text-zinc-300">{[92, 71, 66, 88][index]}</span>
                <span className="text-zinc-300">{[18, 54, 61, 22][index]}</span>
              </div>
            ))}
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

function ArchitectureTree() {
  const branches = [
    "Onboarding",
    "Feedback Intelligence",
    "Identity & Onboarding Intelligence",
    "Market & Growth Intelligence",
    "AI Copilot",
  ];

  return (
    <div>
      <div className="flex items-center gap-3">
        <Building2 className="size-5 text-zinc-950" />
        <p className="font-semibold text-zinc-950">Contas</p>
      </div>
      <div className="mt-4 space-y-3 border-l border-zinc-200 pl-5">
        {branches.map((branch) => (
          <div className="flex items-center gap-3" key={branch}>
            <CheckCircle2 className="size-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-700">
              {branch}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <CircleGauge className="size-4 text-zinc-950" />
        <span className="text-sm font-semibold text-zinc-950">
          Camada central de inteligência
        </span>
      </div>
    </div>
  );
}
