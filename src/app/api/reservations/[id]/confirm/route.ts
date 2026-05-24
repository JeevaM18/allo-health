import { NextRequest, NextResponse } from "next/server";
import { confirmReservation } from "@/features/reservation/confirm.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await confirmReservation(id);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "EXPIRED") {
      return NextResponse.json(
        { error: "Reservation expired" },
        { status: 410 }
      );
    }

    return NextResponse.json(
      { error: "Failed to confirm reservation" },
      { status: 400 }
    );
  }
}
