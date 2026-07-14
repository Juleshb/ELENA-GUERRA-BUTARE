-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "confirmationSmsSentAt" TIMESTAMP(3);
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "confirmationWhatsappSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ContactMessageReply" ADD COLUMN IF NOT EXISTS "emailSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ContactMessageReply" ADD COLUMN IF NOT EXISTS "smsSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ContactMessageReply" ADD COLUMN IF NOT EXISTS "whatsappSent" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: existing admin replies were sent by email
UPDATE "ContactMessageReply"
SET "emailSent" = true
WHERE "senderType" = 'ADMIN';
