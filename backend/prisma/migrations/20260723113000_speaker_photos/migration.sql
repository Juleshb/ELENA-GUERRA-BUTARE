-- Speaker portraits for story / speech sections
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "principalName" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "principalPhotoUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "motherElenaPhotoUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "directorPhotoUrl" TEXT;
