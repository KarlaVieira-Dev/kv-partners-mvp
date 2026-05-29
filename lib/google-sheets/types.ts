export type ExecutiveAccountRow = {
  account: string;
  type: string;
  healthScore: number;
  riskScore: number;
  status: string;
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
