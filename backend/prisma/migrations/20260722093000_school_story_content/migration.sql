-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "schoolMotto" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "historicalBackground" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "principalMessage" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "principalTitle" TEXT DEFAULT 'Headmistress';
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "motherElenaHistory" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "directorMessage" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "directorName" TEXT;
