const twilio = require('twilio');
const { schoolName, normalizePhone, truncate, shortRef } = require('./phone');
const { isMetaWhatsAppConfigured, sendMetaWhatsApp } = require('./metaWhatsApp');

let client = null;

function isTwilioEnabled() {
  return process.env.TWILIO_ENABLED !== 'false';
}

function isTwilioConfigured() {
  return Boolean(
    isTwilioEnabled() && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  );
}

function isSmsConfigured() {
  return Boolean(isTwilioConfigured() && process.env.TWILIO_PHONE_NUMBER);
}

function isTwilioWhatsAppConfigured() {
  return Boolean(isTwilioConfigured() && process.env.TWILIO_WHATSAPP_NUMBER);
}

function getWhatsAppProvider() {
  const preferred = (process.env.WHATSAPP_PROVIDER || '').toLowerCase();
  if (preferred === 'meta' && isMetaWhatsAppConfigured()) return 'meta';
  if (preferred === 'twilio' && isTwilioWhatsAppConfigured()) return 'twilio';
  if (isMetaWhatsAppConfigured()) return 'meta';
  if (isTwilioWhatsAppConfigured()) return 'twilio';
  return null;
}

function isWhatsAppConfigured() {
  return Boolean(getWhatsAppProvider());
}

function getClient() {
  if (!isTwilioConfigured()) return null;
  if (!client) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

async function sendSms({ to, body }) {
  const twilioClient = getClient();
  const from = process.env.TWILIO_PHONE_NUMBER;
  const normalized = normalizePhone(to);

  if (!twilioClient || !from) {
    return { sent: false, reason: 'SMS not configured', provider: 'twilio' };
  }
  if (!normalized) {
    return { sent: false, reason: 'Invalid phone number', provider: 'twilio' };
  }

  try {
    const message = await twilioClient.messages.create({
      from,
      to: normalized,
      body: truncate(body, 1500),
    });
    return { sent: true, sid: message.sid, to: normalized, provider: 'twilio' };
  } catch (err) {
    console.error('[twilio] SMS failed:', err.message);
    return { sent: false, reason: err.message, to: normalized, provider: 'twilio' };
  }
}

async function sendWhatsAppViaTwilio({ to, body }) {
  const twilioClient = getClient();
  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  const normalized = normalizePhone(to);

  if (!twilioClient || !from) {
    return { sent: false, reason: 'Twilio WhatsApp not configured', provider: 'twilio' };
  }
  if (!normalized) {
    return { sent: false, reason: 'Invalid phone number', provider: 'twilio' };
  }

  const toAddress = normalized.startsWith('whatsapp:') ? normalized : `whatsapp:${normalized}`;
  const fromAddress = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;

  try {
    const message = await twilioClient.messages.create({
      from: fromAddress,
      to: toAddress,
      body: truncate(body, 1500),
    });
    return { sent: true, sid: message.sid, to: toAddress, provider: 'twilio' };
  } catch (err) {
    console.error('[twilio] WhatsApp failed:', err.message);
    return { sent: false, reason: err.message, to: toAddress, provider: 'twilio' };
  }
}

async function sendWhatsApp({ to, body }) {
  const provider = getWhatsAppProvider();
  if (provider === 'meta') return sendMetaWhatsApp({ to, body });
  if (provider === 'twilio') return sendWhatsAppViaTwilio({ to, body });
  return { sent: false, reason: 'WhatsApp not configured' };
}

function buildContactConfirmationText({ contact }) {
  const ref = shortRef(contact.id);
  const subject = contact.subject ? ` (${contact.subject})` : '';
  return `Dear ${contact.name}, thank you for contacting ${schoolName()}${subject}. We received your message (Ref: ${ref}) and will reply soon. — ${schoolName()}, Butare`;
}

function buildAdminAlertText({ contact }) {
  const ref = shortRef(contact.id);
  return `New inquiry on ${schoolName()} website.\nFrom: ${contact.name}\nPhone: ${contact.phone || '—'}\nEmail: ${contact.email}\nRef: ${ref}\n\n${truncate(contact.message, 200)}`;
}

function buildReplyText({ contact, replyBody, adminUser }) {
  const ref = shortRef(contact.id);
  const adminName = adminUser?.name || 'School Administration';
  return `Dear ${contact.name}, ${schoolName()} (Ref: ${ref}) replies:\n\n${truncate(replyBody, 900)}\n\n— ${adminName}`;
}

async function sendContactConfirmationSms({ contact }) {
  if (!contact.phone) return { sent: false, reason: 'No phone number' };
  return sendSms({
    to: contact.phone,
    body: buildContactConfirmationText({ contact }),
  });
}

async function sendContactConfirmationWhatsApp({ contact }) {
  if (!contact.phone) return { sent: false, reason: 'No phone number' };
  return sendWhatsApp({
    to: contact.phone,
    body: buildContactConfirmationText({ contact }),
  });
}

async function sendNewMessageAlertSms({ contact }) {
  const adminPhone = process.env.TWILIO_ADMIN_PHONE;
  if (!adminPhone) return { sent: false, reason: 'Admin phone not configured' };
  return sendSms({
    to: adminPhone,
    body: buildAdminAlertText({ contact }),
  });
}

async function sendContactReplySms({ contact, replyBody, adminUser }) {
  if (!contact.phone) return { sent: false, reason: 'No phone number' };
  return sendSms({
    to: contact.phone,
    body: buildReplyText({ contact, replyBody, adminUser }),
  });
}

async function sendContactReplyWhatsApp({ contact, replyBody, adminUser }) {
  if (!contact.phone) return { sent: false, reason: 'No phone number' };
  return sendWhatsApp({
    to: contact.phone,
    body: buildReplyText({ contact, replyBody, adminUser }),
  });
}

async function sendOtpSms({ phone, name, code, purpose }) {
  const label = purpose === 'LOGIN' ? 'sign-in' : 'verification';
  return sendSms({
    to: phone,
    body: `Dear ${name || 'there'}, your ${schoolName()} ${label} code is ${code}. Expires in 10 minutes. Do not share this code.`,
  });
}

function getMessagingStatus() {
  const whatsappProvider = getWhatsAppProvider();
  return {
    twilioConfigured: isTwilioConfigured(),
    sms: isSmsConfigured(),
    whatsapp: isWhatsAppConfigured(),
    whatsappProvider,
    metaWhatsAppConfigured: isMetaWhatsAppConfigured(),
    twilioWhatsAppConfigured: isTwilioWhatsAppConfigured(),
    adminAlerts: Boolean(process.env.TWILIO_ADMIN_PHONE && isSmsConfigured()),
  };
}

module.exports = {
  isTwilioConfigured,
  isSmsConfigured,
  isWhatsAppConfigured,
  getWhatsAppProvider,
  getMessagingStatus,
  normalizePhone,
  sendSms,
  sendWhatsApp,
  sendContactConfirmationSms,
  sendContactConfirmationWhatsApp,
  sendNewMessageAlertSms,
  sendContactReplySms,
  sendContactReplyWhatsApp,
  sendOtpSms,
};
