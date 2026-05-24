import { NextRequest, NextResponse } from "next/server";
import { confirmReservation } from "@/features/reservation/confirm.service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await confirmReservation(id);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    if (error.message === "EXPIRED") {
      return NextResponse.json(
        { error: "Reservation expired" },
        {
          status: 410,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      { error: "Failed to confirm reservation" },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
