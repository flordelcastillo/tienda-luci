-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "audience" TEXT NOT NULL DEFAULT 'mujer',
ADD COLUMN     "hypoallergenic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "measurements" TEXT NOT NULL DEFAULT '';
