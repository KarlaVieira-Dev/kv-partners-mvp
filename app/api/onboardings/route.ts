import { NextResponse } from "next/server";

import { getOnboardingsFromSheets } from "@/lib/google-sheets/onboardings";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getOnboardingsFromSheets();

  return NextResponse.json(data);
}
