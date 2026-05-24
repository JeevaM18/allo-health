import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: {
        inventories: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    type ProductWithInventory = typeof products[number];

    const productsWithAvailableStock = products.map(
      (product: ProductWithInventory) => {
        const totalStock = (product.inventories ?? []).reduce(
          (acc: number, inv: ProductWithInventory["inventories"][number]) =>
            acc + inv.totalStock,
          0
        );

        const reservedStock = (product.inventories ?? []).reduce(
          (acc: number, inv: ProductWithInventory["inventories"][number]) =>
            acc + inv.reservedStock,
          0
        );

        const availableStock = totalStock - reservedStock;

        return {
          id: product.id,
          name: product.name,
          createdAt: product.createdAt,
          totalStock,
          reservedStock,
          availableStock,
          inventories: (product.inventories ?? []).map(
            (inv: ProductWithInventory["inventories"][number]) => ({
              id: inv.id,
              totalStock: inv.totalStock,
              reservedStock: inv.reservedStock,
              availableStock: inv.totalStock - inv.reservedStock,
              warehouse: {
                id: inv.warehouse.id,
                name: inv.warehouse.name,
                location: inv.warehouse.location,
              },
            })
          ),
        };
      }
    );

    return NextResponse.json(productsWithAvailableStock, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
