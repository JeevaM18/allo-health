import { NextRequest, NextResponse } from "next/server";
import { createReservation } from "@/features/reservation/reservation.service";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const key = req.headers.get("Idempotency-Key");

    // 1️⃣ Check if request already processed
    if (key) {
      const cached = await redis.get(key);

      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // 2️⃣ Process normally
    const reservation = await createReservation(body);

    // 3️⃣ Store response
    if (key) {
      await redis.set(key, reservation, { ex: 600 }); // 10 mins
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