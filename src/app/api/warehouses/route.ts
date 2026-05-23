import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const detailedWarehouses = warehouses.map((warehouse) => ({
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
      createdAt: warehouse.createdAt,
      inventories: warehouse.inventories.map((inv) => ({
        id: inv.id,
        totalStock: inv.totalStock,
        reservedStock: inv.reservedStock,
        availableStock: inv.totalStock - inv.reservedStock,
        product: {
          id: inv.product.id,
          name: inv.product.name,
        },
      })),
    }));

    return NextResponse.json(detailedWarehouses);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}
