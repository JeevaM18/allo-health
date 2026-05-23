import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function releaseReservation(reservationId: string) {
  const reservation = await db.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    throw new Error("NOT_FOUND");
  }

  if (reservation.status !== "PENDING") {
    throw new Error("INVALID_STATE");
  }

  // Rollback stock
  await db.inventory.updateMany({
    where: {
      productId: reservation.productId,
      warehouseId: reservation.warehouseId,
    },
    data: {
      reservedStock: {
        decrement: reservation.quantity,
      },
    },
  });

  const updated = await db.reservation.update({
    where: { id: reservationId },
    data: {
      status: "RELEASED",
    },
  });

  logger.info({ reservationId }, "Reservation released");

  return updated;
}