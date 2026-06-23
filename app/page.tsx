// app/page.tsx
// Landing page KV Partners — redesign dark/índigo
// Substitui o arquivo app/page.tsx existente no repositório

import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ background: '#0b0f1a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      }}>
        <div>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#6366f1' }}>KV</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}> Partners</span>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
            Product Intelligence Ecosystem
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link href="/executive-center" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Módulos</Link>
          <Link href="/pipeline"  style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Pipeline</Link>
          <a
            href="https://kv-partner-hub.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
          >
            Portal
          </a>
          <Link href="/executive-center" style={{
            background: '#6366f1', color: '#fff', padding: '8px 20px',
            borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none',
          }}>
            Acessar sistema →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '72px 40px 56px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(99,102,241,0.15)', border: '0.5px solid rgba(99,102,241,0.4)',
          borderRadius: 20, padding: '4px 14px', fontSize: 12, color: '#a5b4fc', marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Em produção · atualizado diariamente
        </div>

        <h1 style={{
          fontSize: 52, fontWeight: 700, lineHeight: 1.15,
          letterSpacing: '-1px', marginBottom: 20, maxWidth: 700,
        }}>
          Inteligência de produto.{' '}
          <span style={{ color: '#6366f1' }}>Antes do problema chegar.</span>
        </h1>

        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
          maxWidth: 520, marginBottom: 36,
        }}>
          Ecossistema B2B SaaS que transforma sinais dispersos — onboarding, feedbacks, comportamento —
          em decisões executivas acionáveis.
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/executive-center" style={{
            background: '#6366f1', color: '#fff', padding: '12px 28px',
            borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none',
          }}>
            Explorar o sistema →
          </Link>
          <a
            href="https://kv-partner-hub.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'transparent', color: 'rgba(255,255,255,0.6)',
              border: '0.5px solid rgba(255,255,255,0.2)', padding: '12px 24px',
              borderRadius: 8, fontSize: 14, textDecoration: 'none',
            }}
          >
            Ver portal do cliente
          </a>
        </div>
      </section>

      <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.07)', margin: '0 40px' }} />

      {/* PIPELINE STATUS STRIP */}
      <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 40px' }}>
        <div style={{
          background: 'rgba(34,197,94,0.06)', border: '0.5px solid rgba(34,197,94,0.2)',
          borderRadius: 10, padding: '20px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#86efac' }}>Pipeline IOI · rodando</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                Snapshot diário às 00h · Google Apps Script
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { n: '12', l: 'contas' },
              { n: '10', l: 'snapshots / conta' },
              { n: '18', l: 'score médio', green: true },
            ].map(({ n, l, green }) => (
              <div key={l} style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: green ? '#22c55e' : '#fff' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MÓDULOS */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 40px 56px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          Módulos
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.5px' }}>
          Tudo conectado, em um só lugar
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 36 }}>
          Cada módulo alimenta o próximo. Nenhum dado parado.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { title: 'Centro Executivo',   desc: 'Visão consolidada de todas as contas. KPIs, alertas e prioridades.', green: false },
            { title: 'Inteligência IOI',   desc: 'Score de risco por conta. Detecta padrões antes do churn.',           green: false },
            { title: 'Pipeline Automático',desc: 'Snapshot diário de todos os scores. Histórico completo.',              green: true  },
            { title: 'Onboarding',         desc: 'Acompanhamento de ativações e marcos por conta.',                     green: false },
            { title: 'Feedbacks + IA',     desc: 'NPS, CSAT e análise automática com IA generativa.',                   green: false },
            { title: 'Portal do Cliente',  desc: 'Cada cliente acessa o próprio score e histórico em tempo real.',      green: false },
          ].map(({ title, desc, green }) => (
            <div key={title} style={{
              background: green ? 'rgba(34,197,94,0.06)' : 'rgba(99,102,241,0.07)',
              border: `0.5px solid ${green ? 'rgba(34,197,94,0.25)' : 'rgba(99,102,241,0.25)'}`,
              borderRadius: 10, padding: 20,
            }}>
              <h3 style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
                color: green ? '#86efac' : '#a5b4fc', marginBottom: 8,
              }}>
                {title}
              </h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.07)', margin: '0 40px' }} />

      {/* FOOTER */}
      <footer style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 40px', marginTop: 0,
      }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#6366f1' }}>KV</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}> Partners</span>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
            Next.js · TypeScript · Google Sheets · Render · Lovable · Claude
          </p>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
          &ldquo;Os sinais aparecem antes dos problemas.&rdquo;
        </p>
      </footer>

    </div>
  )
}
