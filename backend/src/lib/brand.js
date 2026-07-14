const DEFAULT_LOGO = '/logo.jpg';

const LEGACY_LOGO_PATHS = new Set(['/logo.png', '/logo2.png', 'logo.png', 'logo2.png']);

function resolveLogoUrl(logoUrl) {
  if (!logoUrl || LEGACY_LOGO_PATHS.has(logoUrl.trim())) {
    return DEFAULT_LOGO;
  }
  return logoUrl;
}

function normalizeSettings(settings) {
  if (!settings) return settings;
  return {
    ...settings,
    logoUrl: resolveLogoUrl(settings.logoUrl),
  };
}

module.exports = {
  DEFAULT_LOGO,
  resolveLogoUrl,
  normalizeSettings,
};
