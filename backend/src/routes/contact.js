const express = require('express');
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const {
  isMailConfigured,
  sendContactConfirmation,
  sendNewMessageAlert,
  sendContactReply,
  sendOtpEmail,
} = require('../lib/mail');
const {
  isSmsConfigured,
  isWhatsAppConfigured,
  getMessagingStatus,
  sendContactConfirmationSms,
  sendContactConfirmationWhatsApp,
  sendNewMessageAlertSms,
  sendContactReplySms,
  sendContactReplyWhatsApp,
} = require('../lib/twilio');
const { createOtp } = require('../lib/otp');
const { emitChatReply, emitNewConversation, emitConversationUpdate } = require('../lib/chatSocket');

const router = express.Router();

function validateMessage(body) {
  const { name, email, message } = body;
  if (!name?.trim() || name.trim().length < 2) {
    return 'Name is required (at least 2 characters).';
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'A valid email address is required.';
  }
  if (!message?.trim() || message.trim().length < 10) {
    return 'Message is required (at least 10 characters).';
  }
  if (message.trim().length > 5000) {
    return 'Message must be 5000 characters or less.';
  }
  return null;
}

async function getSchoolEmail() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
  return process.env.SCHOOL_EMAIL || settings?.email || null;
}

function buildSuccessMessage({ firstName, email, emailSent, smsSent, whatsappSent }) {
  const channels = [];
  if (emailSent) channels.push('email');
  if (smsSent) channels.push('SMS');
  if (whatsappSent) channels.push('WhatsApp');

  if (channels.length > 1) {
    const list = `${channels.slice(0, -1).join(', ')} and ${channels[channels.length - 1]}`;
    return `Thank you for reaching out, ${firstName}! A confirmation was sent via ${list}. Our team will reply as soon as possible.`;
  }
  if (emailSent) {
    return `Thank you for reaching out to us, ${firstName}! A confirmation email has been sent to ${email}. Our team will reply as soon as possible.`;
  }
  if (smsSent || whatsappSent) {
    return `Thank you for reaching out, ${firstName}! We received your message and sent a confirmation to your phone. Our team will reply as soon as possible.`;
  }
  return `Thank you for reaching out to us, ${firstName}! We have received your message and our team will respond as soon as possible.`;
}

router.get('/messaging-status', authRequired, (_req, res) => {
  res.json({
    email: isMailConfigured(),
    ...getMessagingStatus(),
  });
});

router.post('/', async (req, res) => {
  try {
    const error = validateMessage(req.body);
    if (error) return res.status(400).json({ error });

    const { name, email, phone, subject, message, createAccount } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    let portalUserId = null;
    const existingPortal = await prisma.portalUser.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingPortal) portalUserId = existingPortal.id;

    const contact = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
        portalUserId,
      },
    });

    const schoolEmail = await getSchoolEmail();
    let emailSent = false;
    let smsSent = false;
    let whatsappSent = false;

    if (isMailConfigured()) {
      try {
        const confirmation = await sendContactConfirmation({ contact, schoolEmail });
        if (confirmation.sent) {
          emailSent = true;
          await prisma.contactMessage.update({
            where: { id: contact.id },
            data: { confirmationSentAt: new Date() },
          });
        }
        await sendNewMessageAlert({ contact, schoolEmail });
      } catch (mailErr) {
        console.error('[contact] Email delivery failed:', mailErr.message);
      }
    }

    if (contact.phone) {
      if (isSmsConfigured()) {
        try {
          const smsResult = await sendContactConfirmationSms({ contact });
          if (smsResult.sent) {
            smsSent = true;
            await prisma.contactMessage.update({
              where: { id: contact.id },
              data: { confirmationSmsSentAt: new Date() },
            });
          }
          await sendNewMessageAlertSms({ contact });
        } catch (smsErr) {
          console.error('[contact] SMS delivery failed:', smsErr.message);
        }
      }

      if (isWhatsAppConfigured()) {
        try {
          const waResult = await sendContactConfirmationWhatsApp({ contact });
          if (waResult.sent) {
            whatsappSent = true;
            await prisma.contactMessage.update({
              where: { id: contact.id },
              data: { confirmationWhatsappSentAt: new Date() },
            });
          }
        } catch (waErr) {
          console.error('[contact] WhatsApp delivery failed:', waErr.message);
        }
      }
    }

    const firstName = name.trim().split(' ')[0];
    let otpSent = false;
    let needsOtpVerification = false;

    if (createAccount && !existingPortal) {
      needsOtpVerification = true;
      if (isMailConfigured()) {
        try {
          const { code } = await createOtp(normalizedEmail, 'REGISTER');
          await sendOtpEmail({
            email: normalizedEmail,
            name: name.trim(),
            code,
            purpose: 'REGISTER',
          });
          otpSent = true;
        } catch (otpErr) {
          console.error('[contact] OTP email failed:', otpErr.message);
        }
      }
    }

    emitNewConversation({
      conversation: { ...contact, replies: [], _count: { replies: 0 } },
    });

    res.status(201).json({
      id: contact.id,
      emailSent,
      smsSent,
      whatsappSent,
      otpSent,
      needsOtpVerification,
      hasAccount: Boolean(existingPortal),
      email: normalizedEmail,
      name: name.trim(),
      phone: phone?.trim() || null,
      message: buildSuccessMessage({ firstName, email: contact.email, emailSent, smsSent, whatsappSent }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/', authRequired, async (req, res) => {
  try {
    const { unread } = req.query;
    const messages = await prisma.contactMessage.findMany({
      where: unread === 'true' ? { read: false } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        replies: { orderBy: { sentAt: 'asc' } },
        _count: { select: { replies: true } },
      },
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.get('/:id', authRequired, async (req, res) => {
  try {
    const message = await prisma.contactMessage.findUnique({
      where: { id: req.params.id },
      include: { replies: { orderBy: { sentAt: 'asc' } } },
    });
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

router.post('/:id/reply', authRequired, async (req, res) => {
  try {
    const { body, channels } = req.body;
    if (!body?.trim() || body.trim().length < 5) {
      return res.status(400).json({ error: 'Reply message is required (at least 5 characters).' });
    }
    if (body.trim().length > 5000) {
      return res.status(400).json({ error: 'Reply must be 5000 characters or less.' });
    }

    const contact = await prisma.contactMessage.findUnique({
      where: { id: req.params.id },
    });
    if (!contact) return res.status(404).json({ error: 'Message not found' });

    const requested = Array.isArray(channels) ? channels : ['email'];
    const useEmail = requested.includes('email');
    const useSms = requested.includes('sms');
    const useWhatsapp = requested.includes('whatsapp');

    if (!useEmail && !useSms && !useWhatsapp) {
      return res.status(400).json({ error: 'Select at least one delivery channel.' });
    }

    let emailSent = false;
    let smsSent = false;
    let whatsappSent = false;
    const deliveryErrors = [];

    if (useEmail) {
      if (!isMailConfigured()) {
        deliveryErrors.push('Email is not configured on the server.');
      } else {
        const mailResult = await sendContactReply({
          contact,
          replyBody: body.trim(),
          adminUser: req.user,
        });
        if (mailResult.sent) emailSent = true;
        else deliveryErrors.push('Failed to send email reply.');
      }
    }

    if (useSms) {
      if (!contact.phone) {
        deliveryErrors.push('Contact has no phone number for SMS.');
      } else if (!isSmsConfigured()) {
        deliveryErrors.push('SMS is not configured on the server.');
      } else {
        const smsResult = await sendContactReplySms({
          contact,
          replyBody: body.trim(),
          adminUser: req.user,
        });
        if (smsResult.sent) smsSent = true;
        else deliveryErrors.push(smsResult.reason || 'Failed to send SMS.');
      }
    }

    if (useWhatsapp) {
      if (!contact.phone) {
        deliveryErrors.push('Contact has no phone number for WhatsApp.');
      } else if (!isWhatsAppConfigured()) {
        deliveryErrors.push('WhatsApp is not configured on the server.');
      } else {
        const waResult = await sendContactReplyWhatsApp({
          contact,
          replyBody: body.trim(),
          adminUser: req.user,
        });
        if (waResult.sent) whatsappSent = true;
        if (!waResult.sent) deliveryErrors.push(waResult.reason || 'Failed to send WhatsApp message.');
      }
    }

    if (!emailSent && !smsSent && !whatsappSent) {
      return res.status(500).json({
        error: deliveryErrors[0] || 'Failed to send reply on any channel.',
        deliveryErrors,
      });
    }

    const reply = await prisma.contactMessageReply.create({
      data: {
        messageId: contact.id,
        senderType: 'ADMIN',
        body: body.trim(),
        adminName: req.user.name || 'Administrator',
        adminEmail: req.user.email,
        emailSent,
        smsSent,
        whatsappSent,
      },
    });

    await prisma.contactMessage.update({
      where: { id: contact.id },
      data: { read: true },
    });

    emitChatReply({
      conversationId: contact.id,
      reply,
      portalUserId: contact.portalUserId,
    });

    res.status(201).json({
      ...reply,
      deliveryErrors: deliveryErrors.length ? deliveryErrors : undefined,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

router.patch('/:id', authRequired, async (req, res) => {
  try {
    const { read } = req.body;
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { read: read !== undefined ? Boolean(read) : true },
      include: { replies: { orderBy: { sentAt: 'asc' } } },
    });
    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
