const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const admin = req.query.admin === 'true';
    const staff = await prisma.staffMember.findMany({
      where: admin ? {} : { published: true },
      orderBy: { order: 'asc' },
    });
    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

router.post('/', authRequired, async (req, res) => {
  try {
    const member = await prisma.staffMember.create({ data: req.body });
    res.status(201).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

router.put('/:id', authRequired, async (req, res) => {
  try {
    const member = await prisma.staffMember.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    await prisma.staffMember.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

module.exports = router;
