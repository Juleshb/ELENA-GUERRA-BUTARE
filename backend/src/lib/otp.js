const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('./prisma');

const OTP_TTL_MS = 10 * 60 * 1000;

function generateOtpCode() {
  return String(crypto.randomInt(100000, 999999));
}

async function createOtp(email, purpose) {
  const normalized = email.trim().toLowerCase();
  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.emailOtp.deleteMany({ where: { email: normalized, purpose } });
  await prisma.emailOtp.create({
    data: { email: normalized, codeHash, purpose, expiresAt },
  });

  return { code, expiresAt };
}

async function verifyOtp(email, purpose, code) {
  const normalized = email.trim().toLowerCase();
  const record = await prisma.emailOtp.findFirst({
    where: { email: normalized, purpose },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) return { ok: false, error: 'No verification code found. Please request a new one.' };
  if (record.expiresAt < new Date()) {
    await prisma.emailOtp.delete({ where: { id: record.id } });
    return { ok: false, error: 'Verification code has expired. Please request a new one.' };
  }

  const match = await bcrypt.compare(String(code).trim(), record.codeHash);
  if (!match) return { ok: false, error: 'Invalid verification code.' };

  await prisma.emailOtp.delete({ where: { id: record.id } });
  return { ok: true };
}

module.exports = { createOtp, verifyOtp, OTP_TTL_MS };
