import { NextRequest, NextResponse } from "next/server";
import { createReservation } from "@/features/reservation/reservation.service";
import { reservationSchema } from "@/features/reservation/reservation.schema";
import { redis } from "@/lib/redis";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const key = req.headers.get("Idempotency-Key");

    if (key) {
      const cached = await redis.get(key);

      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    }

    const json = await req.json();
    const body = reservationSchema.parse(json);

    const reservation = await createReservation(body);

    if (key) {
      await redis.set(key, JSON.stringify(reservation), "EX", 600);
    }

    return NextResponse.json(reservation);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

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