const express = require('express');
const prisma = require('../lib/prisma');
const { createOtp, verifyOtp } = require('../lib/otp');
const { isMailConfigured, sendOtpEmail } = require('../lib/mail');
const { portalAuthRequired, signPortalToken } = require('../middleware/portalAuth');
const { emitChatReply, emitConversationUpdate } = require('../lib/chatSocket');

const router = express.Router();

router.post('/otp/send', async (req, res) => {
  try {
    const { email, purpose = 'LOGIN', name } = req.body;
    if (!email?.trim()) return res.status(400).json({ error: 'Email is required.' });

    const normalized = email.trim().toLowerCase();
    const otpPurpose = purpose === 'REGISTER' ? 'REGISTER' : 'LOGIN';

    if (otpPurpose === 'LOGIN') {
      const user = await prisma.portalUser.findUnique({ where: { email: normalized } });
      if (!user) {
        return res.status(404).json({
          error: 'No account found for this email. Submit a contact message and create an account first.',
        });
      }
    }

    if (!isMailConfigured()) {
      return res.status(503).json({ error: 'Email service is not configured.' });
    }

    const { code } = await createOtp(normalized, otpPurpose);
    const displayName =
      name ||
      (await prisma.portalUser.findUnique({ where: { email: normalized } }))?.name ||
      'Guest';

    await sendOtpEmail({ email: normalized, name: displayName, code, purpose: otpPurpose });

    res.json({ message: 'Verification code sent to your email.', email: normalized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send verification code.' });
  }
});

router.post('/otp/verify', async (req, res) => {
  try {
    const { email, code, name, phone, messageId } = req.body;
    if (!email?.trim() || !code) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const normalized = email.trim().toLowerCase();
    const purpose = req.body.purpose === 'LOGIN' ? 'LOGIN' : 'REGISTER';

    const check = await verifyOtp(normalized, purpose, code);
    if (!check.ok) return res.status(400).json({ error: check.error });

    let user = await prisma.portalUser.findUnique({ where: { email: normalized } });

    if (!user) {
      if (!name?.trim()) {
        return res.status(400).json({ error: 'Name is required to create your account.' });
      }
      user = await prisma.portalUser.create({
        data: {
          email: normalized,
          name: name.trim(),
          phone: phone?.trim() || null,
          emailVerifiedAt: new Date(),
        },
      });
    } else {
      user = await prisma.portalUser.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      });
    }

    if (messageId) {
      await prisma.contactMessage.updateMany({
        where: { id: messageId, email: normalized },
        data: { portalUserId: user.id },
      });
    } else {
      await prisma.contactMessage.updateMany({
        where: { email: normalized, portalUserId: null },
        data: { portalUserId: user.id },
      });
    }

    const token = signPortalToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

router.get('/me', portalAuthRequired, async (req, res) => {
  const user = await prisma.portalUser.findUnique({
    where: { id: req.portalUser.id },
    select: { id: true, email: true, name: true, phone: true, emailVerifiedAt: true },
  });
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  res.json(user);
});

router.get('/conversations', portalAuthRequired, async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      where: { portalUserId: req.portalUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: { orderBy: { sentAt: 'asc' } },
      },
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load conversations.' });
  }
});

router.post('/conversations/:id/reply', portalAuthRequired, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body?.trim() || body.trim().length < 2) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const contact = await prisma.contactMessage.findFirst({
      where: { id: req.params.id, portalUserId: req.portalUser.id },
    });
    if (!contact) return res.status(404).json({ error: 'Conversation not found.' });

    const reply = await prisma.contactMessageReply.create({
      data: {
        messageId: contact.id,
        senderType: 'USER',
        body: body.trim(),
        adminName: req.portalUser.name,
      },
    });

    await prisma.contactMessage.update({
      where: { id: contact.id },
      data: { read: false },
    });

    emitChatReply({
      conversationId: contact.id,
      reply,
      portalUserId: contact.portalUserId,
    });

    emitConversationUpdate({
      conversationId: contact.id,
      updates: { read: false },
      portalUserId: contact.portalUserId,
    });

    res.status(201).json(reply);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

module.exports = router;
