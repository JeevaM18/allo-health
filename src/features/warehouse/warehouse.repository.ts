import { db } from "@/lib/db";

export async function getWarehouseById(id: string) {
  return db.warehouse.findUnique({
    where: { id },
  });
}

export async function listWarehouses() {
  return db.warehouse.findMany();
}
