/*
  Warnings:

  - The primary key for the `ClosedOrders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tradeId` on the `ClosedOrders` table. All the data in the column will be lost.
  - The required column `orderId` was added to the `ClosedOrders` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `quantity` to the `ClosedOrders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ClosedOrders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClosedOrders" DROP CONSTRAINT "ClosedOrders_pkey",
DROP COLUMN "tradeId",
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD CONSTRAINT "ClosedOrders_pkey" PRIMARY KEY ("orderId");
