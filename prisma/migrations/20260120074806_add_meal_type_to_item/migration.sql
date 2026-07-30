/*
  Warnings:

  - You are about to drop the column `itemId` on the `Subcategory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,mealType]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,date,mealType]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,mealType]` on the table `Subcategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mealType` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mealType` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mealType` to the `Subcategory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('DESJEJUM', 'ALMOCO', 'CAFE_TARDE', 'JANTAR', 'CEIA', 'LANCHE', 'BEBIDAS', 'CAFE_NOTURNO');

-- DropForeignKey
ALTER TABLE "public"."Subcategory" DROP CONSTRAINT "Subcategory_itemId_fkey";

-- DropIndex
DROP INDEX "public"."Item_name_key";

-- DropIndex
DROP INDEX "public"."Order_companyId_date_key";

-- DropIndex
DROP INDEX "public"."Subcategory_name_itemId_key";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "mealType" "MealType" NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "mealType" "MealType" NOT NULL;

-- AlterTable
ALTER TABLE "Subcategory" DROP COLUMN "itemId",
ADD COLUMN     "mealType" "MealType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_mealType_key" ON "Item"("name", "mealType");

-- CreateIndex
CREATE UNIQUE INDEX "Order_companyId_date_mealType_key" ON "Order"("companyId", "date", "mealType");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_name_mealType_key" ON "Subcategory"("name", "mealType");
