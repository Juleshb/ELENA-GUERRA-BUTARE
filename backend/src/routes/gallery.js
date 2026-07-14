const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function normalizeImagePayload(payload = {}) {
  const toNullable = (value) => {
    const next = typeof value === 'string' ? value.trim() : value;
    return next ? next : null;
  };

  return {
    title: toNullable(payload.title),
    caption: toNullable(payload.caption),
    imageUrl: String(payload.imageUrl || '').trim(),
    category: toNullable(payload.category),
    order: Number.isFinite(Number(payload.order)) ? Number(payload.order) : 0,
    published: payload.published !== false,
  };
}

router.get('/', async (req, res) => {
  try {
    const admin = req.query.admin === 'true';
    const images = await prisma.galleryImage.findMany({
      where: admin ? {} : { published: true },
      orderBy: { order: 'asc' },
    });
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

router.post('/', authRequired, async (req, res) => {
  try {
    const payload = normalizeImagePayload(req.body);
    if (!payload.imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    const image = await prisma.galleryImage.create({ data: payload });
    res.status(201).json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create gallery image' });
  }
});

router.put('/:id', authRequired, async (req, res) => {
  try {
    const payload = normalizeImagePayload(req.body);
    if (!payload.imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    const image = await prisma.galleryImage.update({
      where: { id: req.params.id },
      data: payload,
    });
    res.json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update gallery image' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    await prisma.galleryImage.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
});

router.post('/bulk', authRequired, async (req, res) => {
  try {
    const input = Array.isArray(req.body?.images) ? req.body.images : [];
    const images = input
      .map((row) => normalizeImagePayload(row))
      .filter((row) => row.imageUrl);

    if (!images.length) {
      return res.status(400).json({ error: 'No valid images provided' });
    }

    const result = await prisma.galleryImage.createMany({ data: images });
    res.status(201).json({ count: result.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create gallery images' });
  }
});

module.exports = router;
