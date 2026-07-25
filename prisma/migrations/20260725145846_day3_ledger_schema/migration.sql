-- CreateEnum
CREATE TYPE "MonoCategory" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K');

-- CreateEnum
CREATE TYPE "Regime" AS ENUM ('MONOTRIBUTO', 'RI');

-- CreateEnum
CREATE TYPE "AlertKind" AS ENUM ('CEILING_PCT', 'RECATEGORIZATION_WINDOW');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "category" "MonoCategory" NOT NULL DEFAULT 'A',
ADD COLUMN     "categoryCeilingArs" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "regime" "Regime" NOT NULL DEFAULT 'MONOTRIBUTO';

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "channel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Income" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL,
    "amountForeign" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "amountArs" DECIMAL(14,2) NOT NULL,
    "bnaRate" DECIMAL(14,4) NOT NULL,
    "description" TEXT,
    "invoiced" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "AlertKind" NOT NULL,
    "threshold" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL,
    "payload" JSONB,

    CONSTRAINT "AlertEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Income_userId_earnedAt_idx" ON "Income"("userId", "earnedAt");

-- CreateIndex
CREATE INDEX "Income_userId_invoiced_idx" ON "Income"("userId", "invoiced");

-- CreateIndex
CREATE INDEX "AlertEvent_userId_kind_threshold_idx" ON "AlertEvent"("userId", "kind", "threshold");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
