export const DEFAULT_LOGO = '/logo.jpg';

/** Default hero background — replace by setting Hero Video URL in admin or adding /hero.mp4 to public/ */
export const DEFAULT_HERO_VIDEO =
  'https://videos.pexels.com/video-files/3195394/3195394-sd_640_360_25fps.mp4';

const LEGACY_LOGO_PATHS = new Set(['/logo.png', '/logo2.png', 'logo.png', 'logo2.png']);

export function resolveLogoUrl(logoUrl) {
  if (!logoUrl || LEGACY_LOGO_PATHS.has(logoUrl.trim())) {
    return DEFAULT_LOGO;
  }
  return logoUrl;
}

export function resolveHeroVideoUrl(videoUrl) {
  if (!videoUrl?.trim()) return DEFAULT_HERO_VIDEO;
  return videoUrl.trim();
}
