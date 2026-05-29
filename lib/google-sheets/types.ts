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
};
