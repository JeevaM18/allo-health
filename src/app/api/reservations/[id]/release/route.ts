import { NextRequest, NextResponse } from "next/server";
import { releaseReservation } from "@/features/reservation/release.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await releaseReservation(id);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to release reservation" },
      { status: 400 }
    );
  }
}
