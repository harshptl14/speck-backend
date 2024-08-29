/*
  Warnings:

  - You are about to drop the column `areaOfStudyId` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `areaOfStudyId` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the `AreaOfStudy` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,roadmapId,topicId,subtopicId]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roadmapId,name]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roadmapId` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roadmapId` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AreaOfStudy" DROP CONSTRAINT "AreaOfStudy_userId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_areaOfStudyId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_areaOfStudyId_fkey";

-- DropIndex
DROP INDEX "Progress_userId_areaOfStudyId_topicId_subtopicId_key";

-- DropIndex
DROP INDEX "Topic_areaOfStudyId_name_key";

-- AlterTable
ALTER TABLE "Progress" DROP COLUMN "areaOfStudyId",
ADD COLUMN     "roadmapId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "areaOfStudyId",
ADD COLUMN     "roadmapId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "AreaOfStudy";

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "markdown" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_userId_name_key" ON "Roadmap"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_roadmapId_topicId_subtopicId_key" ON "Progress"("userId", "roadmapId", "topicId", "subtopicId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_roadmapId_name_key" ON "Topic"("roadmapId", "name");

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
