/*
  Warnings:

  - The values [JAVA,PYTHON,JAVASCRIPT,TYPESCRIPT,GO,RUST] on the enum `Language` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Language_new" AS ENUM ('C', 'CPP');
ALTER TABLE "Challenge" ALTER COLUMN "languages" TYPE "Language_new"[] USING ("languages"::text::"Language_new"[]);
ALTER TYPE "Language" RENAME TO "Language_old";
ALTER TYPE "Language_new" RENAME TO "Language";
DROP TYPE "public"."Language_old";
COMMIT;
