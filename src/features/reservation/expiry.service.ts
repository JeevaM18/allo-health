import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function cleanupExpiredReservations() {
  const expired = await db.reservation.findMany({
    where: {
      status: "PENDING",
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  for (const res of expired) {
    await db.inventory.updateMany({
      where: {
        productId: res.productId,
        warehouseId: res.warehouseId,
      },
      data: {
        reservedStock: {
          decrement: res.quantity,
        },
      },
    });

    await db.reservation.update({
      where: { id: res.id },
      data: { status: "RELEASED" },
    });

    logger.info({ id: res.id }, "Expired reservation released");
  }

  return expired.length;
}
