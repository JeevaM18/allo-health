import { db } from "@/lib/db";

export async function getProductById(id: string) {
  return db.product.findUnique({
    where: { id },
  });
}

export async function listProducts() {
  return db.product.findMany();
}
