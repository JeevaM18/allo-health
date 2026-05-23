import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function confirmReservation(reservationId: string) {
  const reservation = await db.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    throw new Error("NOT_FOUND");
  }

  if (reservation.status !== "PENDING") {
    throw new Error("INVALID_STATE");
  }

  if (new Date() > reservation.expiresAt) {
    throw new Error("EXPIRED");
  }

  const updated = await db.reservation.update({
    where: { id: reservationId },
    data: {
      status: "CONFIRMED",
    },
  });

  logger.info({ reservationId }, "Reservation confirmed");

  return updated;
}
