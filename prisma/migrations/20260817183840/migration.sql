-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "telegramBotToken" TEXT,
    "telegramChatId" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
