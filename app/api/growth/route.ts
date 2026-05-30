import { NextResponse } from "next/server";

import { getGrowthFromSheets } from "@/lib/google-sheets/growth";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getGrowthFromSheets();

  return NextResponse.json(data);
}
