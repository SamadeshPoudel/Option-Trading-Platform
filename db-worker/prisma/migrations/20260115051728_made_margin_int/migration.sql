/*
  Warnings:

  - Changed the type of `margin` on the `ClosedOrders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ClosedOrders" DROP COLUMN "margin",
ADD COLUMN     "margin" INTEGER NOT NULL;
