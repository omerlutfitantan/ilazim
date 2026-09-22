import { NextResponse } from "next/server";

/** Eski iyzico / Shopier endpoint — Whop kullanın. */
export async function POST() {
  return NextResponse.json(
    { error: "Deprecated (use /api/payments/whop/webhook)" },
    { status: 410 },
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Deprecated (use Whop checkout)" },
    { status: 410 },
  );
}
