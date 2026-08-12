/*
  Warnings:

  - You are about to drop the column `weekdayQuantity` on the `UserItemConfig` table. All the data in the column will be lost.
  - You are about to drop the column `weekdayQuantity` on the `UserSubcategoryConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserItemConfig" DROP COLUMN "weekdayQuantity",
ADD COLUMN     "fridayQuantity" INTEGER,
ADD COLUMN     "mondayQuantity" INTEGER,
ADD COLUMN     "thursdayQuantity" INTEGER,
ADD COLUMN     "tuesdayQuantity" INTEGER,
ADD COLUMN     "wednesdayQuantity" INTEGER;

-- AlterTable
ALTER TABLE "UserSubcategoryConfig" DROP COLUMN "weekdayQuantity",
ADD COLUMN     "fridayQuantity" INTEGER,
ADD COLUMN     "mondayQuantity" INTEGER,
ADD COLUMN     "thursdayQuantity" INTEGER,
ADD COLUMN     "tuesdayQuantity" INTEGER,
ADD COLUMN     "wednesdayQuantity" INTEGER;
