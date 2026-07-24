-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "stockApplied" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "brandName" TEXT NOT NULL DEFAULT 'Teia',
    "announcement" TEXT NOT NULL DEFAULT '',
    "heroKicker" TEXT NOT NULL DEFAULT '',
    "heroTitle" TEXT NOT NULL DEFAULT '',
    "heroSubtitle" TEXT NOT NULL DEFAULT '',
    "heroTagline" TEXT NOT NULL DEFAULT '',
    "heroImage" TEXT NOT NULL DEFAULT '',
    "footerText" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "freeShippingCents" INTEGER NOT NULL DEFAULT 0,
    "colorPrimary" TEXT NOT NULL DEFAULT '',
    "colorAccent" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);
