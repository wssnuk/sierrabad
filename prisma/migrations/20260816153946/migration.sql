-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "shuttleNumber" TEXT;

-- AlterTable
ALTER TABLE "GamePlayer" ALTER COLUMN "team" SET DEFAULT 0;
