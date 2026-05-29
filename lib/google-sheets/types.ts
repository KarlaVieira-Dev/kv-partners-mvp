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
