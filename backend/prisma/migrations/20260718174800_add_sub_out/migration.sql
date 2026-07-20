/*
  Warnings:

  - Added the required column `expectedOutput` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "expectedOutput" TEXT NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "timeLimitMin" INTEGER NOT NULL DEFAULT 5;
