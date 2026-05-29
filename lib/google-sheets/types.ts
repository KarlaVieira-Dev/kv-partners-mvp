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
