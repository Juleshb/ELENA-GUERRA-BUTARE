const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const admin = req.query.admin === 'true';
    const where = admin ? {} : { published: true };

    let protocol = await prisma.admissionProtocol.findUnique({ where: { id: 'default' } });
    if (!protocol && !admin) {
      protocol = null;
    } else if (!protocol) {
      protocol = await prisma.admissionProtocol.create({ data: { id: 'default' } });
    }

    const [steps, requirements, fees, faqs] = await Promise.all([
      prisma.admissionStep.findMany({
        where,
        orderBy: { stepNumber: 'asc' },
      }),
      prisma.admissionRequirement.findMany({
        where,
        orderBy: [{ category: 'asc' }, { order: 'asc' }],
      }),
      prisma.admissionFee.findMany({
        where,
        orderBy: { order: 'asc' },
      }),
      prisma.admissionFaq.findMany({
        where,
        orderBy: { order: 'asc' },
      }),
    ]);

    res.json({ protocol, steps, requirements, fees, faqs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admissions data' });
  }
});

router.put('/protocol', authRequired, async (req, res) => {
  try {
    const protocol = await prisma.admissionProtocol.upsert({
      where: { id: 'default' },
      update: req.body,
      create: { id: 'default', ...req.body },
    });
    res.json(protocol);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update protocol' });
  }
});

router.post('/steps', authRequired, async (req, res) => {
  try {
    const step = await prisma.admissionStep.create({ data: req.body });
    res.status(201).json(step);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create step' });
  }
});

router.put('/steps/:id', authRequired, async (req, res) => {
  try {
    const step = await prisma.admissionStep.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(step);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

router.delete('/steps/:id', authRequired, async (req, res) => {
  try {
    await prisma.admissionStep.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete step' });
  }
});

router.post('/requirements', authRequired, async (req, res) => {
  try {
    const item = await prisma.admissionRequirement.create({ data: req.body });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create requirement' });
  }
});

router.put('/requirements/:id', authRequired, async (req, res) => {
  try {
    const item = await prisma.admissionRequirement.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update requirement' });
  }
});

router.delete('/requirements/:id', authRequired, async (req, res) => {
  try {
    await prisma.admissionRequirement.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete requirement' });
  }
});

router.post('/fees', authRequired, async (req, res) => {
  try {
    const fee = await prisma.admissionFee.create({ data: req.body });
    res.status(201).json(fee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create fee' });
  }
});

router.put('/fees/:id', authRequired, async (req, res) => {
  try {
    const fee = await prisma.admissionFee.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(fee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update fee' });
  }
});

router.delete('/fees/:id', authRequired, async (req, res) => {
  try {
    await prisma.admissionFee.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete fee' });
  }
});

router.post('/faqs', authRequired, async (req, res) => {
  try {
    const faq = await prisma.admissionFaq.create({ data: req.body });
    res.status(201).json(faq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

router.put('/faqs/:id', authRequired, async (req, res) => {
  try {
    const faq = await prisma.admissionFaq.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(faq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

router.delete('/faqs/:id', authRequired, async (req, res) => {
  try {
    await prisma.admissionFaq.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

module.exports = router;
