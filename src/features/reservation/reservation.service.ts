import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { reserveStock } from "./reservation.repository";

export async function createReservation({
  productId,
  warehouseId,
  quantity,
  userId,
}: {
  productId: string;
  warehouseId: string;
  quantity: number;
  userId?: string;
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
        userId,
      },
    });

    logger.info({ reservationId: reservation.id }, "Reservation created");

    return reservation;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
