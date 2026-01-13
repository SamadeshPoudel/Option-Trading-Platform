-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClosedOrders" (
    "tradeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "margin" TEXT NOT NULL,
    "leverage" TEXT NOT NULL,
    "openPrice" INTEGER NOT NULL,
    "closePrice" INTEGER NOT NULL,
    "pnl" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ClosedOrders_pkey" PRIMARY KEY ("tradeId")
);

-- AddForeignKey
ALTER TABLE "ClosedOrders" ADD CONSTRAINT "ClosedOrders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
