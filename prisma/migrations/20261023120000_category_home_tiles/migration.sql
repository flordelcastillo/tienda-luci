-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "image" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "showOnHome" BOOLEAN NOT NULL DEFAULT true;

-- Orden inicial de las categorías que ya existen
UPDATE "Category" SET "position" = 1 WHERE "slug" = 'collares';
UPDATE "Category" SET "position" = 2 WHERE "slug" = 'aros';
UPDATE "Category" SET "position" = 3 WHERE "slug" = 'anillos';
UPDATE "Category" SET "position" = 4 WHERE "slug" = 'pulseras';
