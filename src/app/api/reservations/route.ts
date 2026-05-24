import { NextRequest, NextResponse } from "next/server";
import { createReservation } from "@/features/reservation/reservation.service";
import { reservationSchema } from "@/features/reservation/reservation.schema";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to reserve stock." },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const json = await req.json();
    const body = reservationSchema.parse(json);

    const key = req.headers.get("Idempotency-Key");

    // 1️⃣ Check if request already processed
    if (key) {
      const cached = await redis.get(key);

      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            "Cache-Control": "no-store",
          },
        });
      }
    }

    // 2️⃣ Process normally
    const reservation = await createReservation({
      ...body,
      userId: session.user.email,
    });

    // 3️⃣ Store response
    if (key) {
      await redis.set(key, reservation, { ex: 600 }); // 10 mins
    }

    return NextResponse.json(reservation, {
      headers: {
        "Cache-Control": "no-store",
      },
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (error.message === "OUT_OF_STOCK") {
      return NextResponse.json(
        { error: "Not enough stock" },
        {
          status: 409,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}