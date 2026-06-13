-- CreateTable
CREATE TABLE "ScheduledOrderItem" (
    "id" TEXT NOT NULL,
    "scheduledOrderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ScheduledOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "applyAsDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduledOrderItem_scheduledOrderId_idx" ON "ScheduledOrderItem"("scheduledOrderId");

-- CreateIndex
CREATE INDEX "ScheduledOrder_userId_idx" ON "ScheduledOrder"("userId");

-- CreateIndex
CREATE INDEX "ScheduledOrder_date_idx" ON "ScheduledOrder"("date");

-- AddForeignKey
ALTER TABLE "ScheduledOrderItem" ADD CONSTRAINT "ScheduledOrderItem_scheduledOrderId_fkey" FOREIGN KEY ("scheduledOrderId") REFERENCES "ScheduledOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledOrderItem" ADD CONSTRAINT "ScheduledOrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledOrderItem" ADD CONSTRAINT "ScheduledOrderItem_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledOrder" ADD CONSTRAINT "ScheduledOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
