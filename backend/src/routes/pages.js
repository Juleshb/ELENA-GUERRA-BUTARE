const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const { slugify } = require('../utils/slugify');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const admin = req.query.admin === 'true';
    const pages = await prisma.page.findMany({
      where: admin ? {} : { published: true },
      orderBy: [{ navOrder: 'asc' }, { title: 'asc' }],
    });
    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const page = await prisma.page.findFirst({
      where: { slug: req.params.slug, published: true },
    });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

router.get('/:id', authRequired, async (req, res) => {
  try {
    const page = await prisma.page.findUnique({ where: { id: req.params.id } });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

router.post('/', authRequired, async (req, res) => {
  try {
    const { title, slug, content, excerpt, published, showInNav, navOrder } = req.body;
    const page = await prisma.page.create({
      data: {
        title,
        slug: slug || slugify(title),
        content: content || '',
        excerpt,
        published: published ?? false,
        showInNav: showInNav ?? true,
        navOrder: navOrder ?? 0,
      },
    });
    res.status(201).json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

router.put('/:id', authRequired, async (req, res) => {
  try {
    const { title, slug, content, excerpt, published, showInNav, navOrder } = req.body;
    const page = await prisma.page.update({
      where: { id: req.params.id },
      data: {
        title,
        slug,
        content,
        excerpt,
        published,
        showInNav,
        navOrder,
      },
    });
    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    await prisma.page.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

module.exports = router;
