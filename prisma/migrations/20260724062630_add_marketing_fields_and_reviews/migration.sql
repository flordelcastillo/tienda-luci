-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "compareAtPrice" INTEGER,
ADD COLUMN     "giftIdea" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "giftWrap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metal" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "stoneColor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "waterproof" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
