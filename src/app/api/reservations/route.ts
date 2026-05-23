import { NextRequest, NextResponse } from "next/server";
import { createReservation } from "@/services/reservation.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const reservation = await createReservation(body);

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