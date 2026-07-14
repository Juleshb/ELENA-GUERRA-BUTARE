-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "confirmationSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ContactMessageReply" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "adminName" TEXT,
    "adminEmail" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessageReply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContactMessageReply" ADD CONSTRAINT "ContactMessageReply_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ContactMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
