import { db } from "@/lib/db";

export async function reserveStock({
  productId,
  warehouseId,
  quantity,
}: {
  productId: string;
  warehouseId: string;
  quantity: number;
}) {
  const result = await db.$executeRaw`
    UPDATE "Inventory"
    SET "reservedStock" = "reservedStock" + ${quantity}
    WHERE "productId" = ${productId}
    AND "warehouseId" = ${warehouseId}
    AND ("totalStock" - "reservedStock") >= ${quantity}
  `;

  return result;
}
