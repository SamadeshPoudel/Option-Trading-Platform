/*
  Warnings:

  - Changed the type of `leverage` on the `ClosedOrders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ClosedOrders" DROP COLUMN "leverage",
ADD COLUMN     "leverage" INTEGER NOT NULL;
