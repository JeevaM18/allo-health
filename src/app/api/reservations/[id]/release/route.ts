import { NextRequest, NextResponse } from "next/server";
import { releaseReservation } from "@/features/reservation/release.service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await releaseReservation(id);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to release reservation" },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
