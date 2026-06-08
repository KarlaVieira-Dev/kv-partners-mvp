# KV Partners MVP

Product Intelligence Ecosystem MVP.

## Objetivo

Construir uma plataforma de inteligencia operacional e estrategica capaz de
transformar sinais operacionais, feedbacks, riscos e oportunidades em
recomendacoes acionaveis.

## Modulos

- Executive Center
- Accounts
- Onboarding Center
- Feedback Center
- Risk Center
- Growth Center
- AI Copilot

## Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui

## Desenvolvimento

Instale as dependencias:

```bash
npm install
```

Rode o servidor local:

```bash
npm run dev
```

Acesse:

```bash
http://localhost:3000
```

## Google Analytics 4

O projeto usa GA4 por variavel de ambiente, sem Measurement ID fixo no codigo.

### 1. Onde obter o Measurement ID

No Google Analytics, acesse:

`Admin` -> `Data streams` -> selecione o stream Web -> copie o `Measurement ID`.

O identificador segue o formato:

```bash
G-XXXXXXXXXX
```

### 2. Como configurar no Render

No dashboard do Render:

1. Acesse o servico do KV Partners MVP.
2. Abra `Environment`.
3. Adicione a variavel:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

4. Salve e execute `Manual Deploy` -> `Deploy latest commit`.

### 3. Como validar o Analytics

Depois do deploy:

1. Abra o site publicado.
2. Navegue entre paginas como `/`, `/executive-center` e `/ai-copilot`.
3. No Google Analytics, acesse `Reports` -> `Realtime`.
4. Confirme se aparecem usuarios ativos, page views e paginas acessadas.

Tambem e possivel validar pelo navegador em `DevTools` -> `Network`, buscando requisicoes para `googletagmanager.com` ou `google-analytics.com`.

O tracking registra page views, navegacao entre paginas, referrer, tempo de permanencia e permite acompanhar as paginas mais acessadas nos relatorios do GA4.

### Eventos personalizados

A aplicacao tambem envia eventos de interacao para o GA4:

- `center_view`: acesso aos centros principais da plataforma.
- `strategic_question_click`: clique em pergunta pronta do Assistente Estrategico.
- `external_link_click`: clique em links externos, quando existirem.

Todos os eventos incluem `source: "kv_partners"` e parametros de contexto como pagina, nome do centro, pergunta ou URL do link.

## Status

Fundacao tecnica do MVP em construcao.
