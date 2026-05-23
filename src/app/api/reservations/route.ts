import { NextRequest, NextResponse } from "next/server";
import { createReservation } from "@/services/reservation.service";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const key = req.headers.get("Idempotency-Key");

    if (key) {
      const cached = await redis.get(key);

      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    }

    const body = await req.json();

    const reservation = await createReservation(body);

    if (key) {
      await redis.set(key, JSON.stringify(reservation), "EX", 600);
    }

    return NextResponse.json(reservation);
  } catch (error: any) {
    if (error.message === "OUT_OF_STOCK") {
      return NextResponse.json(
        { error: "Not enough stock" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}