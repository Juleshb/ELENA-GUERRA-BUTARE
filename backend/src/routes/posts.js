const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const { slugify } = require('../utils/slugify');

const router = express.Router();

const postInclude = {
  images: { orderBy: { order: 'asc' } },
};

function storyToHtml(text) {
  if (!text?.trim()) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return text
    .trim()
    .split(/\n\n+/)
    .filter(Boolean)
    .map((p) => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:')) return null;
  return trimmed;
}

function sanitizeImages(images = []) {
  return images
    .map((img, index) => ({
      url: sanitizeImageUrl(img.url),
      caption: img.caption?.trim() || null,
      order: typeof img.order === 'number' ? img.order : index,
    }))
    .filter((img) => img.url);
}

async function syncPostImages(postId, images = []) {
  await prisma.postImage.deleteMany({ where: { postId } });
  if (!images.length) return;

  await prisma.postImage.createMany({
    data: images.map((img, index) => ({
      postId,
      url: img.url,
      caption: img.caption?.trim() || null,
      order: typeof img.order === 'number' ? img.order : index,
    })),
  });
}

router.get('/', async (req, res) => {
  try {
    const admin = req.query.admin === 'true';
    const posts = await prisma.post.findMany({
      where: admin ? {} : { published: true },
      orderBy: { publishedAt: 'desc' },
      include: postInclude,
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const post = await prisma.post.findFirst({
      where: { slug: req.params.slug, published: true },
      include: postInclude,
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.get('/:id', authRequired, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: postInclude,
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.post('/', authRequired, async (req, res) => {
  try {
    const { title, slug, excerpt, content, coverImage, published, images } = req.body;
    const cleanImages = sanitizeImages(images);
    const cleanCover = sanitizeImageUrl(coverImage) || cleanImages[0]?.url || null;

    if (images?.some((img) => img?.url?.trim?.().startsWith('data:'))) {
      return res.status(400).json({
        error: 'Use the Upload button for images. Pasted image data is not supported.',
      });
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug: slug || slugify(title),
        excerpt,
        content: storyToHtml(content || ''),
        coverImage: cleanCover,
        published: published ?? false,
        publishedAt: published ? new Date() : null,
      },
    });

    await syncPostImages(post.id, cleanImages);

    const full = await prisma.post.findUnique({
      where: { id: post.id },
      include: postInclude,
    });
    res.status(201).json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.put('/:id', authRequired, async (req, res) => {
  try {
    const { title, slug, excerpt, content, coverImage, published, images } = req.body;
    const existing = await prisma.post.findUnique({ where: { id: req.params.id } });
    const cleanImages = images !== undefined ? sanitizeImages(images) : undefined;
    const cleanCover =
      sanitizeImageUrl(coverImage) || cleanImages?.[0]?.url || existing?.coverImage || null;

    if (images?.some((img) => img?.url?.trim?.().startsWith('data:'))) {
      return res.status(400).json({
        error: 'Use the Upload button for images. Pasted image data is not supported.',
      });
    }

    await prisma.post.update({
      where: { id: req.params.id },
      data: {
        title,
        slug,
        excerpt,
        content: storyToHtml(content || ''),
        coverImage: cleanCover,
        published,
        publishedAt:
          published && !existing?.publishedAt ? new Date() : existing?.publishedAt,
      },
    });

    if (cleanImages !== undefined) {
      await syncPostImages(req.params.id, cleanImages);
    }

    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: postInclude,
    });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
