const prisma = require('../lib/prisma');

async function generateReferenceNumber() {
  const year = new Date().getFullYear();
  const prefix = `SH-${year}-`;

  if (!prisma.studentApplication) {
    throw new Error(
      'Database client is out of date. Run: npm run db:generate — then restart the server.'
    );
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = String(Math.floor(10000 + Math.random() * 90000));
    const referenceNumber = `${prefix}${suffix}`;
    const exists = await prisma.studentApplication.findUnique({
      where: { referenceNumber },
    });
    if (!exists) return referenceNumber;
  }

  const count = await prisma.studentApplication.count();
  return `${prefix}${String(count + 1).padStart(5, '0')}`;
}

module.exports = { generateReferenceNumber };
