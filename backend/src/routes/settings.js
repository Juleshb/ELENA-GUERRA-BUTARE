const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const { normalizeSettings, resolveLogoUrl } = require('../lib/brand');

const router = express.Router();

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
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        ...req.body,
        logoUrl: resolveLogoUrl(req.body.logoUrl),
      },
      create: {
        id: 'default',
        ...req.body,
        logoUrl: resolveLogoUrl(req.body.logoUrl),
      },
    });
    res.json(normalizeSettings(settings));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
