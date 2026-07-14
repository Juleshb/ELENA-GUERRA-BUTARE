const { normalizePhone, truncate } = require('./phone');

function isMetaWhatsAppConfigured() {
  return Boolean(
    process.env.META_WHATSAPP_ACCESS_TOKEN && process.env.META_WHATSAPP_PHONE_NUMBER_ID
  );
}

async function sendMetaWhatsApp({ to, body }) {
  const token = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.META_WHATSAPP_API_VERSION || 'v22.0';
  const normalized = normalizePhone(to);

  if (!token || !phoneNumberId) {
    return { sent: false, reason: 'Meta WhatsApp not configured', provider: 'meta' };
  }
  if (!normalized) {
    return { sent: false, reason: 'Invalid phone number', provider: 'meta' };
  }

  const recipient = normalized.replace(/^\+/, '');
  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: { preview_url: false, body: truncate(body, 4096) },
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const reason = data?.error?.message || `Meta API error (${res.status})`;
      console.error('[meta-whatsapp] send failed:', reason, data?.error);
      return { sent: false, reason, to: normalized, provider: 'meta' };
    }

    return {
      sent: true,
      id: data.messages?.[0]?.id,
      to: normalized,
      provider: 'meta',
    };
  } catch (err) {
    console.error('[meta-whatsapp] send failed:', err.message);
    return { sent: false, reason: err.message, to: normalized, provider: 'meta' };
  }
}

module.exports = {
  isMetaWhatsAppConfigured,
  sendMetaWhatsApp,
};
