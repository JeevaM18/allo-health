import { NextResponse } from "next/server";
import { cleanupExpiredReservations } from "@/services/expiry.service";

export async function GET() {
  const count = await cleanupExpiredReservations();

  return NextResponse.json({
    message: `Cleaned ${count} expired reservations`,
  });
}
