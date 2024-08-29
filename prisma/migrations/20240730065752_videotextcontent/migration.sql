/*
  Warnings:

  - The values [YOUTUBE,VIMEO] on the enum `VideoType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VideoType_new" AS ENUM ('VIDEO', 'SHORTS', 'CUSTOM');
ALTER TABLE "VideoContent" ALTER COLUMN "videoType" TYPE "VideoType_new" USING ("videoType"::text::"VideoType_new");
ALTER TYPE "VideoType" RENAME TO "VideoType_old";
ALTER TYPE "VideoType_new" RENAME TO "VideoType";
DROP TYPE "VideoType_old";
COMMIT;

-- AlterTable
ALTER TABLE "VideoContent" ADD COLUMN     "thumbnail" TEXT;
