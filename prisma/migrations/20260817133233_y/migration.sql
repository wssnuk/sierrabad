/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,memberId]` on the table `CheckIn` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_sessionId_memberId_key" ON "CheckIn"("sessionId", "memberId");
