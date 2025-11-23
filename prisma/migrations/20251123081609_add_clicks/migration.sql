-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastClicked" TIMESTAMP(3);
