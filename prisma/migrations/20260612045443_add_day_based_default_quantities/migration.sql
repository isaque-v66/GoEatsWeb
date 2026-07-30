/*
  Warnings:

  - You are about to drop the column `defaultQuantity` on the `UserItemConfig` table. All the data in the column will be lost.
  - You are about to drop the column `defaultQuantity` on the `UserSubcategoryConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserItemConfig" DROP COLUMN "defaultQuantity",
ADD COLUMN     "saturdayQuantity" INTEGER,
ADD COLUMN     "sundayQuantity" INTEGER,
ADD COLUMN     "weekdayQuantity" INTEGER;

-- AlterTable
ALTER TABLE "UserSubcategoryConfig" DROP COLUMN "defaultQuantity",
ADD COLUMN     "saturdayQuantity" INTEGER,
ADD COLUMN     "sundayQuantity" INTEGER,
ADD COLUMN     "weekdayQuantity" INTEGER;
