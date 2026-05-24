import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const warehouses = await db.warehouse.findMany({
      include: {
        inventories: {
          include: {
            product: true,
          },
        },
      },
    });

    type WarehouseWithInventory = typeof warehouses[number];

    const detailedWarehouses = warehouses.map((warehouse: WarehouseWithInventory) => ({
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
      createdAt: warehouse.createdAt,
      inventories: (warehouse.inventories ?? []).map(
        (inv: WarehouseWithInventory["inventories"][number]) => ({
          id: inv.id,
          totalStock: inv.totalStock,
          reservedStock: inv.reservedStock,
          availableStock: inv.totalStock - inv.reservedStock,
          product: {
            id: inv.product.id,
            name: inv.product.name,
          },
        })
      ),
    }));

    return NextResponse.json(detailedWarehouses, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
