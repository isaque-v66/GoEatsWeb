-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserItemConfig" DROP CONSTRAINT "UserItemConfig_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserSubcategoryConfig" DROP CONSTRAINT "UserSubcategoryConfig_userItemId_fkey";

-- AddForeignKey
ALTER TABLE "UserItemConfig" ADD CONSTRAINT "UserItemConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubcategoryConfig" ADD CONSTRAINT "UserSubcategoryConfig_userItemId_fkey" FOREIGN KEY ("userItemId") REFERENCES "UserItemConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
