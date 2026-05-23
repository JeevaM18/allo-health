import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Products
  const product1 = await prisma.product.create({
    data: {
      name: "iPhone 15",
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Samsung Galaxy S24",
    },
  });

  // Create Warehouses
  const warehouse1 = await prisma.warehouse.create({
    data: {
      name: "Chennai Warehouse",
      location: "Chennai",
    },
  });

  const warehouse2 = await prisma.warehouse.create({
    data: {
      name: "Bangalore Warehouse",
      location: "Bangalore",
    },
  });

  // Create Inventory
  await prisma.inventory.createMany({
    data: [
      {
        productId: product1.id,
        warehouseId: warehouse1.id,
        totalStock: 10,
        reservedStock: 0,
      },
      {
        productId: product1.id,
        warehouseId: warehouse2.id,
        totalStock: 5,
        reservedStock: 0,
      },
      {
        productId: product2.id,
        warehouseId: warehouse1.id,
        totalStock: 8,
        reservedStock: 0,
      },
      {
        productId: product2.id,
        warehouseId: warehouse2.id,
        totalStock: 6,
        reservedStock: 0,
      },
    ],
  });

  console.log("✅ Seeding completed");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });