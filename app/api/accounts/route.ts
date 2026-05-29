import { NextResponse } from "next/server";

import { getExecutiveAccountsFromSheets } from "@/lib/google-sheets/executive-center";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getExecutiveAccountsFromSheets();

  return NextResponse.json(data);
}
