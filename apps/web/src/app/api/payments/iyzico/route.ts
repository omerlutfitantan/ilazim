import { NextResponse } from "next/server";

/**
 * Eski iyzico callback endpoint'i.
 * Shopier entegrasyonu ile artık kullanılmıyor.
 */
export async function POST() {
  return NextResponse.json({ error: "Deprecated (use Shopier callback/webhook)" }, { status: 410 });
}
