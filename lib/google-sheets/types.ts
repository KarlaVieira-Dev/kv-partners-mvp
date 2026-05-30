export type ExecutiveAccountRow = {
  account: string;
  city?: string;
  type: string;
  plan?: string;
  segment?: string;
  healthScore: number;
  riskScore: number;
  state?: string;
  status: string;
  size?: string;
  mainReason: string;
  suggestedAction: string;
};

export type ExecutiveAccountsResponse = {
  accounts: ExecutiveAccountRow[];
  source: "google-sheets" | "not-configured";
  modules: string[];
  debug?: {
    sheets: Array<{
      sheet: string;
      attempts: Array<{
        error?: string;
        headers: string[];
        normalizedHeaders: string[];
        rowCount: number;
        status?: number;
        url: string;
      }>;
    }>;
  };
};

export type OnboardingRow = {
  account: string;
  accountId: string;
  currentStep: string;
  daysInProgress: number;
  expectedConclusionDate: string;
  id: string;
  nextAction: string;
  progress: number;
  risk: "Alto" | "Baixo" | "Medio";
  startDate: string;
  status: string;
  timeToValue: number;
};

export type OnboardingsResponse = {
  onboardings: OnboardingRow[];
  source: "google-sheets" | "not-configured";
};

export type RiskRow = {
  accessScore: number;
  accountId: string;
  accountName: string;
  accountStatus: string;
  accountType: string;
  feedbackScore: number;
  healthLevel: string;
  healthScore: number;
  mainReason: string;
  onboardingScore: number;
  riskLevel: string;
  riskScore: number;
  suggestedAction: string;
  usageScore: number;
};

export type RisksResponse = {
  risks: RiskRow[];
  source: "google-sheets" | "not-configured";
};

export type FeedbackRow = {
  accountId: string;
  accountName: string;
  category: string;
  date: string;
  id: string;
  priority: string;
  sentiment: string;
  status: string;
  summary: string;
  theme: string;
};

export type FeedbacksResponse = {
  feedbacks: FeedbackRow[];
  source: "google-sheets" | "not-configured";
};

export type GrowthJtbdRow = {
  accountId: string;
  accountName: string;
  category: string;
  frequency: number;
  id: string;
  impact: string;
  job: string;
  priority: string;
  status: string;
};

export type GrowthInsightRow = {
  accountName: string;
  category: string;
  date: string;
  id: string;
  impact: string;
  insight: string;
  priority: string;
  status: string;
};

export type GrowthRecommendationRow = {
  area: string;
  estimatedImpact: string;
  id: string;
  opportunityScore: number;
  priority: string;
  recommendation: string;
  status: string;
};

export type GrowthRadar = {
  expansion: number;
  operationalEfficiency: number;
  retention: number;
};

export type GrowthResponse = {
  insights: GrowthInsightRow[];
  jtbd: GrowthJtbdRow[];
  radar: GrowthRadar;
  recommendations: GrowthRecommendationRow[];
  source: "google-sheets" | "not-configured";
};
