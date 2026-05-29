import { parseCsvWithMetadata } from "@/lib/google-sheets/csv";
import type {
  OnboardingRow,
  OnboardingsResponse,
} from "@/lib/google-sheets/types";

type SheetRow = Record<string, string>;

const spreadsheetId = () =>
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ??
  process.env.GOOGLE_SHEETS_ACCOUNTS_SPREADSHEET_ID ??
  process.env.GOOGLE_SHEETS_EXECUTIVE_CENTER_SPREADSHEET_ID ??
  "1mM_S-RA7TBK6MC04evhv_U9Y31J0izmsgIhPpn8hBUg";

const toNumber = (value: string) => {
  const parsed = Number(value.replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getCell = (row: SheetRow, keys: string[]) => {
  for (const key of keys) {
    if (row[key]) {
      return row[key].trim();
    }
  }

  return "";
};

const buildSheetCsvUrl = (sheetName: string) => {
  const id = spreadsheetId();
  const params = new URLSearchParams({
    sheet: sheetName,
    tqx: "out:csv",
  });

  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?${params.toString()}`;
};

const readSheet = async (sheetName: string) => {
  const response = await fetch(buildSheetCsvUrl(sheetName), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`${sheetName} responded with ${response.status}`);
  }

  return parseCsvWithMetadata(await response.text()).records;
};

const latestEventByAccount = (events: SheetRow[]) => {
  const latestEvents = new Map<string, SheetRow>();

  for (const event of events) {
    const accountId = getCell(event, ["id conta"]);
    const current = latestEvents.get(accountId);

    if (!accountId) {
      continue;
    }

    if (
      !current ||
      getCell(event, ["data evento"]) > getCell(current, ["data evento"])
    ) {
      latestEvents.set(accountId, event);
    }
  }

  return latestEvents;
};

const riskForOnboarding = ({
  daysInProgress,
  progress,
  status,
}: {
  daysInProgress: number;
  progress: number;
  status: string;
}): OnboardingRow["risk"] => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes("conclu")) {
    return "Baixo";
  }

  if (daysInProgress >= 14 || progress < 50) {
    return "Alto";
  }

  return "Medio";
};

const nextActionForOnboarding = ({
  currentStep,
  event,
  risk,
  status,
}: {
  currentStep: string;
  event?: SheetRow;
  risk: OnboardingRow["risk"];
  status: string;
}) => {
  if (status.toLowerCase().includes("conclu")) {
    return "Onboarding concluido";
  }

  if (risk === "Alto") {
    return "Priorizar desbloqueio da etapa atual";
  }

  return (
    getCell(event ?? {}, ["descricao evento"]) ||
    `Avancar etapa: ${currentStep || "proxima etapa"}`
  );
};

export async function getOnboardingsFromSheets(): Promise<OnboardingsResponse> {
  if (!spreadsheetId()) {
    return {
      onboardings: [],
      source: "not-configured",
    };
  }

  try {
    const [accounts, onboardings, events] = await Promise.all([
      readSheet("01_Contas"),
      readSheet("04_Onboardings"),
      readSheet("05_Eventos"),
    ]);
    const accountNames = new Map(
      accounts.map((account) => [
        getCell(account, ["id conta"]),
        getCell(account, ["nome conta"]),
      ]),
    );
    const eventsByAccount = latestEventByAccount(events);

    return {
      onboardings: onboardings.map((onboarding) => {
        const accountId = getCell(onboarding, ["id conta"]);
        const status = getCell(onboarding, ["status onboarding"]);
        const progress = toNumber(getCell(onboarding, ["percentual conclusao"]));
        const daysInProgress = toNumber(
          getCell(onboarding, ["dias onboarding"]),
        );
        const currentStep = getCell(onboarding, ["etapa atual"]);
        const event = eventsByAccount.get(accountId);
        const risk = riskForOnboarding({
          daysInProgress,
          progress,
          status,
        });

        return {
          account: accountNames.get(accountId) || accountId,
          accountId,
          currentStep,
          daysInProgress,
          expectedConclusionDate: getCell(onboarding, ["data conclusao"]),
          id: getCell(onboarding, ["id onboarding"]),
          nextAction: nextActionForOnboarding({
            currentStep,
            event,
            risk,
            status,
          }),
          progress,
          risk,
          startDate: getCell(onboarding, ["data inicio"]),
          status,
          timeToValue: toNumber(getCell(onboarding, ["time to value"])),
        };
      }),
      source: "google-sheets",
    };
  } catch (error) {
    console.error("Failed to read KV Partners onboarding sheets", error);

    return {
      onboardings: [],
      source: "not-configured",
    };
  }
}
