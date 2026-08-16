-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "courtFeeOverride" INTEGER;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "actualCourtFeePaid" INTEGER,
ADD COLUMN     "actualShuttleCount" INTEGER;
