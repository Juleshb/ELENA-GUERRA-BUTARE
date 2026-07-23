const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const { normalizeSettings, resolveLogoUrl } = require('../lib/brand');

const router = express.Router();

const SETTINGS_FIELDS = [
  'schoolName',
  'tagline',
  'logoUrl',
  'heroTitle',
  'heroSubtitle',
  'heroImageUrl',
  'about',
  'mission',
  'vision',
  'schoolMotto',
  'historicalBackground',
  'principalMessage',
  'principalTitle',
  'principalName',
  'principalPhotoUrl',
  'motherElenaHistory',
  'motherElenaPhotoUrl',
  'directorMessage',
  'directorName',
  'directorPhotoUrl',
  'address',
  'phone',
  'email',
  'facebook',
  'twitter',
  'instagram',
  'youtube',
];

function pickSettings(body = {}) {
  const data = {};
  for (const key of SETTINGS_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (data.logoUrl !== undefined) data.logoUrl = resolveLogoUrl(data.logoUrl);
  return data;
}

router.get('/', async (_req, res) => {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: 'default' } });
    }
    res.json(normalizeSettings(settings));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/', authRequired, async (req, res) => {
  try {
    const data = pickSettings(req.body);
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
    res.json(normalizeSettings(settings));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
