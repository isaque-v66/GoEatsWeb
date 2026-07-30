-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "reviewedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ScheduledOrder" ADD COLUMN     "reviewedAt" TIMESTAMP(3);
