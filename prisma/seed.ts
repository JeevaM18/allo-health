import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data first to prevent duplicate/constraint errors!
  await prisma.inventory.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  // Create Products
  const p1 = await prisma.product.create({ data: { name: "iPhone 15" } });
  const p2 = await prisma.product.create({ data: { name: "Samsung Galaxy S24" } });
  const p3 = await prisma.product.create({ data: { name: "MacBook Pro" } });
  const p4 = await prisma.product.create({ data: { name: "iPad Pro" } });
  const p5 = await prisma.product.create({ data: { name: "AirPods Max" } });

  // Create Warehouses
  const w1 = await prisma.warehouse.create({
    data: { name: "Chennai Warehouse", location: "Chennai" },
  });
  const w2 = await prisma.warehouse.create({
    data: { name: "Bangalore Warehouse", location: "Bangalore" },
  });

  // Create Inventory
  await prisma.inventory.createMany({
    data: [
      { productId: p1.id, warehouseId: w1.id, totalStock: 10, reservedStock: 0 },
      { productId: p1.id, warehouseId: w2.id, totalStock: 5, reservedStock: 0 },
      
      { productId: p2.id, warehouseId: w1.id, totalStock: 8, reservedStock: 0 },
      { productId: p2.id, warehouseId: w2.id, totalStock: 6, reservedStock: 0 },

      { productId: p3.id, warehouseId: w1.id, totalStock: 12, reservedStock: 0 },
      { productId: p3.id, warehouseId: w2.id, totalStock: 4, reservedStock: 0 },

      { productId: p4.id, warehouseId: w1.id, totalStock: 15, reservedStock: 0 },
      { productId: p4.id, warehouseId: w2.id, totalStock: 9, reservedStock: 0 },

      { productId: p5.id, warehouseId: w1.id, totalStock: 7, reservedStock: 0 },
      { productId: p5.id, warehouseId: w2.id, totalStock: 1, reservedStock: 0 }, // Displays 'Only 1 left!' warning status!
    ],
  });

  console.log("✅ Seeding completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });