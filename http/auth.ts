import { betterAuth } from "better-auth";
import { PrismaClient } from "./generated/prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();

export const auth = betterAuth({
  baseURL: "http://localhost:5000",
  trustedOrigins: ["http://localhost:5173"],
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
});




/*
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User{
  id String @id @default(uuid())
  name String?
  email String
  password String
  closedOrders ClosedOrders[]
}

model ClosedOrders{
  orderId String @id @default(uuid())
  userId String
  type String
  asset String
  margin Int
  leverage Int
  quantity Float
  openPrice Int
  closePrice Int
  pnl Float
  status String
  user User @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

}

*/