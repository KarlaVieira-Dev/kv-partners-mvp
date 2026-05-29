import { NextResponse } from "next/server";

import { getRisksFromSheets } from "@/lib/google-sheets/risks";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getRisksFromSheets();

  return NextResponse.json(data);
}
