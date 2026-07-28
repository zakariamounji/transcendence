/*
  Warnings:

  - You are about to drop the column `slug` on the `Challenge` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Challenge_slug_key";

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "slug",
ALTER COLUMN "expReward" SET DEFAULT 6,
ALTER COLUMN "timeLimitMin" SET DEFAULT 15;
