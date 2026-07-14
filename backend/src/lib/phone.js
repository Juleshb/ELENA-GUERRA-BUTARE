function schoolName() {
  return process.env.SMTP_FROM_NAME || 'C.S ELENA GUERRA BUTARE';
}

function normalizePhone(input) {
  if (!input) return null;
  let digits = String(input).replace(/\D/g, '');

  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 10) digits = `250${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith('7')) digits = `250${digits}`;
  if (digits.length < 10) return null;

  return `+${digits}`;
}

function truncate(text, max = 320) {
  const value = String(text || '').trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3)}...`;
}

function shortRef(id) {
  return id.slice(-8).toUpperCase();
}

module.exports = {
  schoolName,
  normalizePhone,
  truncate,
  shortRef,
};
