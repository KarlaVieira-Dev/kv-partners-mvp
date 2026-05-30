import { NextResponse } from "next/server";

import { getFeedbacksFromSheets } from "@/lib/google-sheets/feedbacks";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getFeedbacksFromSheets();

  return NextResponse.json(data);
}
