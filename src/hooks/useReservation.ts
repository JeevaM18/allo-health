import { useState } from "react";

export function useReservation() {
  const [loading, setLoading] = useState(false);

  const createReservation = async (data: { productId: string; warehouseId: string; quantity: number }) => {
    setLoading(true);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create reservation");
      }

      return await res.json();
    } finally {
      setLoading(false);
    }
  };

  return { createReservation, loading };
}
