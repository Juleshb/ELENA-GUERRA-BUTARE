const nodemailer = require('nodemailer');

let transporter = null;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function getTransporter() {
  if (!isMailConfigured()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function schoolName() {
  return process.env.SMTP_FROM_NAME || 'C.S ELENA GUERRA BUTARE';
}

function fromAddress() {
  return {
    name: schoolName(),
    address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
  };
}

function wrapHtml({ title, bodyHtml, footerNote }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:24px 12px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="height:4px;background:linear-gradient(90deg,#1e5a9e 33%,#d71920 33% 66%,#1e5a9e 66%);"></td></tr>
        <tr><td style="padding:28px 32px 8px;">
          <p style="margin:0;font-size:12px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#d71920;">${schoolName()}</p>
          <h1 style="margin:12px 0 0;font-size:22px;color:#0a3058;">${title}</h1>
        </td></tr>
        <tr><td style="padding:8px 32px 24px;font-size:15px;line-height:1.6;color:#334155;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:16px 32px 28px;border-top:1px solid #f1f5f9;font-size:12px;color:#64748b;line-height:1.5;">
          ${footerNote || 'Please do not reply directly to this automated message unless instructed.'}
          <br><br>
          <em>Esprit, garde-nous dans ton amour</em><br>
          ${schoolName()} · Butare, Rwanda
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendMail({ to, subject, text, html, replyTo }) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('[mail] SMTP not configured — email not sent:', subject);
    return { sent: false, reason: 'SMTP not configured' };
  }

  await transport.sendMail({
    from: fromAddress(),
    to,
    replyTo: replyTo || fromAddress().address,
    subject,
    text,
    html,
  });
  return { sent: true };
}

function shortRef(id) {
  return id.slice(-8).toUpperCase();
}

async function sendContactConfirmation({ contact, schoolEmail }) {
  const ref = shortRef(contact.id);
  const subjectLine = contact.subject ? ` — ${contact.subject}` : '';
  const subject = `Thank you for reaching out to us${subjectLine} [Ref: ${ref}]`;

  const text = `Dear ${contact.name},

Thank you for reaching out to ${schoolName()}. We truly appreciate you taking the time to contact us.

We have received your message and our team will review it shortly. A member of staff will get back to you as soon as possible during school working hours.

Reference: ${ref}
Submitted: ${new Date(contact.createdAt).toLocaleString('en-GB')}

Your message:
${contact.message}

If your inquiry is urgent, please call us directly.

With kind regards,
${schoolName()}
Butare, Rwanda`;

  const html = wrapHtml({
    title: 'Thank you for reaching out to us',
    bodyHtml: `
      <p>Dear <strong>${escapeHtml(contact.name)}</strong>,</p>
      <p><strong>Thank you for reaching out to ${schoolName()}.</strong> We truly appreciate you contacting us and want you to know that your message has been received successfully.</p>
      <p>Our administration team will review your inquiry and respond by email as soon as possible during school working hours.</p>
      <table style="width:100%;margin:20px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;border-collapse:collapse;">
        <tr><td style="padding:12px 16px;font-size:13px;"><strong>Reference:</strong> ${ref}</td></tr>
        <tr><td style="padding:0 16px 12px;font-size:13px;"><strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString('en-GB')}</td></tr>
        ${contact.subject ? `<tr><td style="padding:0 16px 12px;font-size:13px;"><strong>Subject:</strong> ${escapeHtml(contact.subject)}</td></tr>` : ''}
      </table>
      <p style="font-size:13px;color:#64748b;margin-bottom:8px;">Your message:</p>
      <blockquote style="margin:0;padding:16px;background:#f1f5f9;border-left:4px solid #1e5a9e;border-radius:0 8px 8px 0;color:#334155;white-space:pre-wrap;">${escapeHtml(contact.message)}</blockquote>
      <p style="margin-top:20px;">Once again, thank you for reaching out to us. We look forward to assisting you.</p>
    `,
    footerNote: 'This is an automatic thank-you message. Our team will reply to you personally by email.',
  });

  const result = await sendMail({
    to: contact.email,
    subject,
    text,
    html,
    replyTo: schoolEmail || fromAddress().address,
  });

  return result;
}

async function sendNewMessageAlert({ contact, schoolEmail }) {
  if (!schoolEmail) return { sent: false };

  const ref = shortRef(contact.id);
  const subject = `[New inquiry] ${contact.name}${contact.subject ? ` — ${contact.subject}` : ''} [${ref}]`;

  const text = `A new message was submitted on the school website.

From: ${contact.name}
Email: ${contact.email}
Phone: ${contact.phone || '—'}
Subject: ${contact.subject || '—'}
Reference: ${ref}

Message:
${contact.message}

Reply from the admin portal: Messages section.`;

  const html = wrapHtml({
    title: 'New contact form message',
    bodyHtml: `
      <p>A new inquiry was submitted on the school website.</p>
      <table style="width:100%;margin:16px 0;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#64748b;width:100px;">From</td><td style="padding:8px 0;"><strong>${escapeHtml(contact.name)}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Phone</td><td style="padding:8px 0;">${escapeHtml(contact.phone || '—')}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Subject</td><td style="padding:8px 0;">${escapeHtml(contact.subject || '—')}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Reference</td><td style="padding:8px 0;">${ref}</td></tr>
      </table>
      <blockquote style="margin:0;padding:16px;background:#f1f5f9;border-left:4px solid #d71920;border-radius:0 8px 8px 0;white-space:pre-wrap;">${escapeHtml(contact.message)}</blockquote>
      <p style="margin-top:16px;font-size:13px;">Open the <strong>Admin → Messages</strong> panel to reply from the system.</p>
    `,
    footerNote: 'Internal notification from the school website contact form.',
  });

  return sendMail({ to: schoolEmail, subject, text, html, replyTo: contact.email });
}

async function sendContactReply({ contact, replyBody, adminUser }) {
  const ref = shortRef(contact.id);
  const subjectPrefix = contact.subject ? `Re: ${contact.subject}` : 'Re: Your message to our school';
  const subject = `${subjectPrefix} [Ref: ${ref}]`;

  const adminName = adminUser?.name || 'School Administration';
  const text = `Dear ${contact.name},

Thank you for contacting ${schoolName()}. Please find our response below regarding your inquiry (Reference: ${ref}).

---
${replyBody}
---

If you have further questions, feel free to reply to this email or contact us again through our website.

Kind regards,
${adminName}
${schoolName()}
Butare, Rwanda`;

  const html = wrapHtml({
    title: 'Response to your inquiry',
    bodyHtml: `
      <p>Dear <strong>${escapeHtml(contact.name)}</strong>,</p>
      <p>Thank you for contacting <strong>${schoolName()}</strong>. Regarding your message (Reference: <strong>${ref}</strong>), please find our response below:</p>
      <div style="margin:20px 0;padding:20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;white-space:pre-wrap;line-height:1.6;">${escapeHtml(replyBody)}</div>
      <p>If you need further assistance, you may reply directly to this email.</p>
      <p style="margin-top:24px;">Kind regards,<br><strong>${escapeHtml(adminName)}</strong><br>${schoolName()}</p>
    `,
    footerNote: 'You may reply directly to this email to continue the conversation.',
  });

  return sendMail({
    to: contact.email,
    subject,
    text,
    html,
    replyTo: fromAddress().address,
  });
}

async function sendOtpEmail({ email, name, code, purpose }) {
  const isLogin = purpose === 'LOGIN';
  const subject = isLogin
    ? `Your sign-in code — ${schoolName()}`
    : `Verify your email — ${schoolName()}`;

  const text = `Dear ${name || 'there'},

Your verification code is: ${code}

This code expires in 10 minutes. Do not share it with anyone.

If you did not request this, you can ignore this email.

${schoolName()}
Butare, Rwanda`;

  const html = wrapHtml({
    title: isLogin ? 'Sign in to your account' : 'Verify your email address',
    bodyHtml: `
      <p>Dear <strong>${escapeHtml(name || 'there')}</strong>,</p>
      <p>${isLogin ? 'Use this code to sign in to your school messaging account:' : 'Use this code to verify your email and activate your account for chat with our school:'}</p>
      <p style="margin:24px 0;text-align:center;">
        <span style="display:inline-block;font-size:32px;font-weight:bold;letter-spacing:0.35em;padding:16px 24px;background:#f1f5f9;border-radius:12px;color:#0a3058;">${code}</span>
      </p>
      <p style="font-size:13px;color:#64748b;">This code expires in <strong>10 minutes</strong>. Never share it with anyone.</p>
    `,
    footerNote: 'If you did not request this code, please ignore this email.',
  });

  return sendMail({ to: email, subject, text, html });
}

module.exports = {
  isMailConfigured,
  sendContactConfirmation,
  sendNewMessageAlert,
  sendContactReply,
  sendOtpEmail,
};
