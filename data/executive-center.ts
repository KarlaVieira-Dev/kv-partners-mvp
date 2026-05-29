export const navigationItems = [
  { label: "Executive Center", href: "/" },
  { label: "Accounts", href: "/accounts" },
  { label: "Onboarding Center", href: "/onboarding-center" },
  { label: "Feedback Center", href: "/feedback-center" },
  { label: "Risk Center", href: "/risk-center" },
  { label: "Growth Center", href: "/growth-center" },
  { label: "AI Copilot", href: "/ai-copilot" },
];

export const executiveMetrics = [
  {
    label: "Health Score Médio",
    value: "82",
    trend: "+4 pts",
    detail: "Média das contas monitoradas pelo ecossistema",
  },
  {
    label: "Contas Monitoradas",
    value: "5",
    trend: "4 módulos",
    detail: "Account Onboarding, Feedback, Identity e Growth",
  },
  {
    label: "Contas em Risco",
    value: "2",
    trend: "Risk 70+",
    detail: "Contas com fricção operacional ou onboarding incompleto",
  },
  {
    label: "Opportunity Score",
    value: "78",
    trend: "+9 pts",
    detail: "Potencial de expansão identificado por sinais combinados",
  },
];

export const focusAccounts = [
  {
    name: "Grupo Orion",
    type: "Enterprise",
    status: "Onboarding incompleto",
    healthScore: 76,
    riskScore: 72,
    mainReason: "Pendências de acesso em Identity & Onboarding Intelligence",
    suggestedAction: "Priorizar revisão de permissões e owners críticos",
  },
  {
    name: "Clínica Alfa",
    type: "Healthcare",
    status: "Risco operacional",
    healthScore: 64,
    riskScore: 81,
    mainReason: "Feedbacks negativos sobre configuração de permissões",
    suggestedAction: "Acionar plano de correção com Account Onboarding",
  },
  {
    name: "Educa Prime",
    type: "Education",
    status: "Expansão potencial",
    healthScore: 91,
    riskScore: 28,
    mainReason: "Uso consistente e feedbacks positivos recorrentes",
    suggestedAction: "Abrir discovery de Market & Growth Intelligence",
  },
  {
    name: "TechFlow",
    type: "SaaS",
    status: "Monitoramento ativo",
    healthScore: 84,
    riskScore: 39,
    mainReason: "Onboarding avançado com baixa fricção operacional",
    suggestedAction: "Manter cadência executiva quinzenal",
  },
  {
    name: "Rede Horizonte",
    type: "Retail",
    status: "Atenção",
    healthScore: 71,
    riskScore: 66,
    mainReason: "Sinais mistos entre adoção e feedback operacional",
    suggestedAction: "Consolidar feedbacks e revisar jornada de onboarding",
  },
];

export const intelligenceSignals = [
  "Contas com onboarding incompleto apresentam maior risco operacional.",
  "Feedbacks negativos recorrentes indicam fricção na configuração de permissões.",
  "Contas com Health Score elevado possuem potencial de expansão.",
];

export const ecosystemModules = [
  "Account Onboarding",
  "Feedback Intelligence",
  "Identity & Onboarding Intelligence",
  "Market & Growth Intelligence",
];

export const executiveSummary = {
  averageRiskScore: 57,
  priorityRecommendations: 4,
};
