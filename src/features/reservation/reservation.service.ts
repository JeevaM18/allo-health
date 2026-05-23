import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { reserveStock } from "./reservation.repository";

export async function createReservation({
  productId,
  warehouseId,
  quantity,
}: {
  productId: string;
  warehouseId: string;
  quantity: number;
}) {
  try {
    const result = await reserveStock({
      productId,
      warehouseId,
      quantity,
    });

    if (result === 0) {
      logger.warn("Stock not available");
      throw new Error("OUT_OF_STOCK");
    }

    const reservation = await db.reservation.create({
      data: {
        productId,
        warehouseId,
        quantity,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    logger.info({ reservationId: reservation.id }, "Reservation created");

    return reservation;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
