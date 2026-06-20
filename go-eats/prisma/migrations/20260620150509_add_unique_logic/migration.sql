/*
  Warnings:

  - A unique constraint covering the columns `[userId,date,mealType]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,date]` on the table `ScheduledOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Order_companyId_date_mealType_key";

-- CreateIndex
CREATE UNIQUE INDEX "Order_userId_date_mealType_key" ON "Order"("userId", "date", "mealType");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledOrder_userId_date_key" ON "ScheduledOrder"("userId", "date");
