"use client";

import {
  ArrowRight,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  MessageSquareText,
  Sparkles,
  Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const carouselSlides = [
  {
    accent: "01",
    description:
      "Contas, onboarding, acessos, eventos e jornadas geram os primeiros sinais sobre a operação.",
    flow: ["Contas", "Onboarding", "Eventos"],
    metric: "Primeiros sinais",
    title: "Sinais Operacionais",
  },
  {
    accent: "02",
    description:
      "Feedbacks são estruturados por tema, sentimento e prioridade para revelar dores recorrentes.",
    flow: ["Feedbacks", "Temas", "Sentimento"],
    metric: "Dores recorrentes",
    title: "Voz do Cliente",
  },
  {
    accent: "03",
    description:
      "Sinais operacionais e feedbacks alimentam scores de risco, alertas e ações sugeridas.",
    flow: ["Sinais", "Score", "Risco", "Ação"],
    metric: "Predição",
    title: "Risco e Predição",
  },
  {
    accent: "04",
    description:
      "Tendências, concorrentes, JTBD e benchmarks ajudam a identificar oportunidades estratégicas.",
    flow: ["Mercado", "Benchmark", "Oportunidades"],
    metric: "Crescimento",
    title: "Mercado e Crescimento",
  },
  {
    accent: "05",
    description:
      "O copiloto consolida todos os sinais e traduz dados complexos em recomendações executivas.",
    flow: ["Dados", "Contexto", "Recomendação", "Decisão"],
    metric: "Decisão",
    title: "AI Copilot",
  },
];

const valueCards = [
  {
    icon: GitBranch,
    title: "Menos reação",
    text: "Identifique sinais antes que virem problemas.",
  },
  {
    icon: BrainCircuit,
    title: "Mais contexto",
    text: "Conecte operação, cliente, risco e mercado.",
  },
  {
    icon: Target,
    title: "Melhor decisão",
    text: "Priorize ações com base em evidências.",
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
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = carouselSlides[activeSlide];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselSlides.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, []);

  const progress = useMemo(
    () => ((activeSlide + 1) / carouselSlides.length) * 100,
    [activeSlide],
  );

  const goToPrevious = () => {
    setActiveSlide(
      (current) =>
        (current - 1 + carouselSlides.length) % carouselSlides.length,
    );
  };

  const goToNext = () => {
    setActiveSlide((current) => (current + 1) % carouselSlides.length);
  };

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
            <a className="hover:text-zinc-950" href="#ecossistema">
              Ecossistema
            </a>
            <a className="hover:text-zinc-950" href="#valor">
              Valor
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
                Ver Demonstração
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
        id="ecossistema"
      >
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-zinc-500">Ecossistema</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Como o ecossistema transforma sinais em decisão
            </h2>
            <p className="mt-3 text-base leading-7 text-zinc-600">
              Cada camada conecta um tipo de sinal até gerar recomendações
              estratégicas.
            </p>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-zinc-950 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="relative border-b border-zinc-200 bg-zinc-950">
            <Image
              alt="Mockup visual da plataforma Product Intelligence Ecosystem"
              className="max-h-[360px] w-full object-cover opacity-95"
              height={720}
              priority
              src="/landing/product-intelligence-mockup.png"
              width={1280}
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent" />
          </div>
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-zinc-200 p-5 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-md bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-white">
                  {slide.accent}
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                  {slide.metric}
                </span>
              </div>
              <h3 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-950">
                {slide.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-zinc-600">
                {slide.description}
              </p>
              <div className="mt-8 flex items-center gap-2">
                <button
                  aria-label="Slide anterior"
                  className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 transition hover:bg-zinc-100"
                  onClick={goToPrevious}
                  type="button"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  aria-label="Próximo slide"
                  className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 transition hover:bg-zinc-100"
                  onClick={goToNext}
                  type="button"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <div className="bg-zinc-950 p-5 text-white">
              <div className="grid min-h-[280px] content-center gap-4">
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
                    Resumo visual
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    {slide.flow.map((item, index) => (
                      <div className="flex items-center gap-3" key={item}>
                        <span className="rounded-md border border-white/10 bg-white/[0.08] px-3 py-2 text-sm font-semibold text-white">
                          {item}
                        </span>
                        {index < slide.flow.length - 1 ? (
                          <ArrowRight className="hidden size-4 text-zinc-500 sm:block" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {["Sinal", "Contexto", "Decisão"].map((label, index) => (
                    <div
                      className="rounded-lg border border-white/10 bg-white/[0.06] p-3"
                      key={label}
                    >
                      <p className="text-xs text-zinc-400">{label}</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {[24, 68, 91][(activeSlide + index) % 3]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-zinc-200 p-4">
            {carouselSlides.map((item, index) => (
              <button
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition",
                  activeSlide === index
                    ? "bg-zinc-950 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
                )}
                key={item.title}
                onClick={() => setActiveSlide(index)}
                type="button"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        id="valor"
      >
        <div className="mb-6 max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Por que isso importa?
          </h2>
          <p className="mt-3 text-base leading-7 text-zinc-600">
            O valor aparece quando sinais deixam de ser fragmentos e passam a
            orientar uma decisão.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
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
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        id="demonstracao"
      >
        <div className="mb-6 max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Explore a Plataforma
          </h2>
          <p className="mt-3 text-base leading-7 text-zinc-600">
            Acesse os centros para ver o ecossistema em funcionamento.
          </p>
        </div>
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
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8">
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
