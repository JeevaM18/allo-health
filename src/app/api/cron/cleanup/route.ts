import { NextResponse } from "next/server";
import { cleanupExpiredReservations } from "@/features/reservation/expiry.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const count = await cleanupExpiredReservations();

  return NextResponse.json({
    message: `Cleaned ${count} expired reservations`,
  }, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
