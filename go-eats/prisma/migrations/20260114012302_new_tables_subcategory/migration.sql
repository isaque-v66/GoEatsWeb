/*
  Warnings:

  - You are about to drop the `meal_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."meal_items" DROP CONSTRAINT "meal_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_companyId_fkey";

-- DropTable
DROP TABLE "public"."meal_items";

-- DropTable
DROP TABLE "public"."orders";

-- DropEnum
DROP TYPE "public"."ItemCategory";

-- DropEnum
DROP TYPE "public"."MealType";

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserItemConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "defaultQuantity" INTEGER,

    CONSTRAINT "UserItemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubcategoryConfig" (
    "id" TEXT NOT NULL,
    "userItemId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "defaultQuantity" INTEGER,

    CONSTRAINT "UserSubcategoryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "quantity" INTEGER NOT NULL,
    "customText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "Item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_name_itemId_key" ON "Subcategory"("name", "itemId");

-- CreateIndex
CREATE INDEX "UserItemConfig_userId_idx" ON "UserItemConfig"("userId");

-- CreateIndex
CREATE INDEX "UserItemConfig_itemId_idx" ON "UserItemConfig"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "UserItemConfig_userId_itemId_key" ON "UserItemConfig"("userId", "itemId");

-- CreateIndex
CREATE INDEX "UserSubcategoryConfig_userItemId_idx" ON "UserSubcategoryConfig"("userItemId");

-- CreateIndex
CREATE INDEX "UserSubcategoryConfig_subcategoryId_idx" ON "UserSubcategoryConfig"("subcategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubcategoryConfig_userItemId_subcategoryId_key" ON "UserSubcategoryConfig"("userItemId", "subcategoryId");

-- CreateIndex
CREATE INDEX "Order_companyId_idx" ON "Order"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_companyId_date_key" ON "Order"("companyId", "date");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_itemId_idx" ON "OrderItem"("itemId");

-- CreateIndex
CREATE INDEX "OrderItem_subcategoryId_idx" ON "OrderItem"("subcategoryId");

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItemConfig" ADD CONSTRAINT "UserItemConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItemConfig" ADD CONSTRAINT "UserItemConfig_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubcategoryConfig" ADD CONSTRAINT "UserSubcategoryConfig_userItemId_fkey" FOREIGN KEY ("userItemId") REFERENCES "UserItemConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubcategoryConfig" ADD CONSTRAINT "UserSubcategoryConfig_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
