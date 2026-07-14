const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../lib/prisma');
const { authRequired } = require('../middleware/auth');
const { generateReferenceNumber } = require('../utils/referenceNumber');

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads/applications');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = /\.(pdf|jpe?g|png|webp)$/;
    const ok = allowed.test(ext);
    cb(ok ? null : new Error('Only PDF, JPEG, PNG, or WebP files are allowed'), ok);
  },
});

const documentFields = upload.fields([
  { name: 'birthCertificate', maxCount: 1 },
  { name: 'reportCard', maxCount: 1 },
  { name: 'studentPhoto', maxCount: 1 },
  { name: 'paymentSlip', maxCount: 1 },
]);

function fileUrl(files, field) {
  const file = files?.[field]?.[0];
  return file ? `/uploads/applications/${file.filename}` : null;
}

function trim(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseBool(value) {
  return value === true || value === 'true' || value === '1';
}

function resolveGuardian(body) {
  const type = trim(body.guardianType);
  if (type === 'FATHER') {
    return {
      guardianType: 'FATHER',
      guardianName: trim(body.fatherName),
      guardianPhone: trim(body.fatherPhone),
      guardianEmail: trim(body.guardianEmail),
      guardianHomeAddress: trim(body.motherHomeAddress),
      guardianOccupation: trim(body.fatherOccupation),
      parentRelation: 'Father',
    };
  }
  if (type === 'MOTHER') {
    return {
      guardianType: 'MOTHER',
      guardianName: trim(body.motherName),
      guardianPhone: trim(body.motherPhone),
      guardianEmail: trim(body.guardianEmail),
      guardianHomeAddress: trim(body.motherHomeAddress),
      guardianOccupation: trim(body.motherOccupation),
      parentRelation: 'Mother',
    };
  }
  return {
    guardianType: 'OTHER',
    guardianName: trim(body.guardianName),
    guardianPhone: trim(body.guardianPhone),
    guardianEmail: trim(body.guardianEmail),
    guardianHomeAddress: trim(body.guardianHomeAddress),
    guardianOccupation: trim(body.guardianOccupation),
    parentRelation: 'Guardian',
  };
}

function validateApplicationBody(body) {
  const missing = [];
  const baseFields = [
    ['studentFirstName', 'student first name'],
    ['studentLastName', 'student last name'],
    ['dateOfBirth', 'date of birth'],
    ['gender', 'gender'],
    ['nationality', 'nationality'],
    ['residenceStatus', 'residence status'],
    ['motherTongue', 'mother tongue'],
    ['previousStudentCode', 'previous student code'],
    ['previousStudentCodeYear', 'previous student code year'],
    ['previousSchoolCode', 'previous school code'],
    ['previousSchoolCodeYear', 'previous school code year'],
    ['previousClassAttended', 'previous class attended'],
    ['classAppliedFor', 'class applied for'],
    ['attendanceType', 'day or boarding'],
    ['country', 'country'],
    ['level', 'study level'],
    ['province', 'province'],
    ['district', 'district'],
    ['sector', 'sector'],
    ['cell', 'cell'],
    ['village', 'village'],
    ['religion', 'religion'],
    ['fundingSource', 'who pays school fees'],
    ['fatherName', "father's name"],
    ['fatherAlive', 'whether father is alive'],
    ['fatherPhone', "father's phone"],
    ['fatherId', "father's ID"],
    ['fatherOccupation', "father's occupation"],
    ['motherName', "mother's name"],
    ['motherAlive', 'whether mother is alive'],
    ['motherPhone', "mother's phone"],
    ['motherId', "mother's ID"],
    ['motherHomeAddress', "mother's home address"],
    ['motherOccupation', "mother's occupation"],
    ['guardianType', 'who is the guardian'],
    ['guardianEmail', 'guardian email'],
    ['healthMedicalBackground', 'health and medical background'],
    ['emergencyContactName', 'emergency contact name'],
    ['emergencyContactPhone', 'emergency contact phone'],
    ['emergencyContactAddress', 'emergency contact address'],
    ['signatureName', 'parent/guardian signature name'],
  ];

  baseFields.forEach(([key, label]) => {
    if (!trim(body[key])) missing.push(label);
  });

  const guardianType = trim(body.guardianType);
  if (guardianType === 'OTHER') {
    [
      ['guardianName', "guardian's name"],
      ['guardianPhone', "guardian's phone"],
      ['guardianHomeAddress', "guardian's home address"],
      ['guardianOccupation', "guardian's occupation"],
    ].forEach(([key, label]) => {
      if (!trim(body[key])) missing.push(label);
    });
  } else if (guardianType === 'FATHER' || guardianType === 'MOTHER') {
    const resolved = resolveGuardian(body);
    if (!resolved.guardianName || !resolved.guardianPhone) {
      missing.push('complete parent details for the selected guardian');
    }
  }

  if (!parseBool(body.agreePhotoUse)) missing.push('photo use consent');
  if (!parseBool(body.agreeFeesNonRefundable)) missing.push('non-refundable fees acknowledgment');

  return missing;
}

const LEVEL_MAP = {
  PRIMARY: 'Primary (P1–P6)',
  ORDINARY_LEVEL: 'Ordinary Level (S1–S3)',
  ADVANCED_LEVEL: 'Advanced Level (S4–S6)',
};

router.post('/', documentFields, async (req, res) => {
  try {
    const body = req.body;
    const missing = validateApplicationBody(body);

    if (missing.length) {
      return res.status(400).json({
        error: `Please complete all required fields: ${missing.join(', ')}.`,
      });
    }

    const paymentSlip = fileUrl(req.files, 'paymentSlip');
    const birthCertificate = fileUrl(req.files, 'birthCertificate');
    const reportCard = fileUrl(req.files, 'reportCard');
    const studentPhoto = fileUrl(req.files, 'studentPhoto');

    const missingDocs = [];
    if (!paymentSlip) missingDocs.push('registration fee payment slip');
    if (!birthCertificate) missingDocs.push('birth certificate');
    if (!reportCard) missingDocs.push('report card');
    if (!studentPhoto) missingDocs.push('passport photo');

    if (missingDocs.length) {
      return res.status(400).json({
        error: `Please upload all required documents: ${missingDocs.join(', ')}.`,
      });
    }

    const validLevels = ['PRIMARY', 'ORDINARY_LEVEL', 'ADVANCED_LEVEL'];
    if (!validLevels.includes(body.level)) {
      return res.status(400).json({ error: 'Invalid application level' });
    }

    const referenceNumber = await generateReferenceNumber();
    const guardian = resolveGuardian(body);

    const application = await prisma.studentApplication.create({
      data: {
        referenceNumber,
        studentFirstName: trim(body.studentFirstName),
        studentLastName: trim(body.studentLastName),
        dateOfBirth: new Date(body.dateOfBirth),
        gender: trim(body.gender),
        nationality: trim(body.nationality),
        residenceStatus: trim(body.residenceStatus),
        motherTongue: trim(body.motherTongue),
        previousStudentCode: trim(body.previousStudentCode),
        previousStudentCodeYear: trim(body.previousStudentCodeYear),
        previousSchoolCode: trim(body.previousSchoolCode),
        previousSchoolCodeYear: trim(body.previousSchoolCodeYear),
        previousClassAttended: trim(body.previousClassAttended),
        classAppliedFor: trim(body.classAppliedFor),
        attendanceType: trim(body.attendanceType),
        country: trim(body.country) || 'RWANDA',
        level: body.level,
        province: trim(body.province),
        district: trim(body.district),
        sector: trim(body.sector),
        cell: trim(body.cell),
        village: trim(body.village),
        religion: trim(body.religion),
        fundingSource: trim(body.fundingSource),
        fatherName: trim(body.fatherName),
        fatherAlive: trim(body.fatherAlive),
        fatherPhone: trim(body.fatherPhone),
        fatherId: trim(body.fatherId),
        fatherOccupation: trim(body.fatherOccupation),
        motherName: trim(body.motherName),
        motherAlive: trim(body.motherAlive),
        motherPhone: trim(body.motherPhone),
        motherId: trim(body.motherId),
        motherHomeAddress: trim(body.motherHomeAddress),
        motherOccupation: trim(body.motherOccupation),
        guardianType: guardian.guardianType,
        guardianName: guardian.guardianName,
        guardianPhone: guardian.guardianPhone,
        guardianEmail: guardian.guardianEmail,
        guardianHomeAddress: guardian.guardianHomeAddress,
        guardianOccupation: guardian.guardianOccupation,
        healthMedicalBackground: trim(body.healthMedicalBackground),
        emergencyContactName: trim(body.emergencyContactName),
        emergencyContactPhone: trim(body.emergencyContactPhone),
        emergencyContactAddress: trim(body.emergencyContactAddress),
        agreePhotoUse: parseBool(body.agreePhotoUse),
        agreeFeesNonRefundable: parseBool(body.agreeFeesNonRefundable),
        signatureName: trim(body.signatureName),
        submittedAtLocation: trim(body.submittedAtLocation) || 'HUYE',
        previousSchool: trim(body.previousSchoolCode),
        currentGrade: trim(body.previousClassAttended),
        parentName: guardian.guardianName,
        parentPhone: guardian.guardianPhone,
        parentEmail: guardian.guardianEmail,
        parentRelation: guardian.parentRelation,
        address: guardian.guardianHomeAddress,
        additionalNotes: trim(body.healthMedicalBackground),
        birthCertificate,
        reportCard,
        studentPhoto,
        paymentSlip,
        statusLogs: {
          create: {
            status: 'PENDING',
            comment: 'Official application form submitted online.',
            adminName: 'System',
          },
        },
      },
    });

    res.status(201).json({
      referenceNumber: application.referenceNumber,
      message: 'Application submitted successfully',
      levelLabel: LEVEL_MAP[application.level],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to submit application' });
  }
});

router.post('/track', async (req, res) => {
  try {
    const { referenceNumber, parentPhone } = req.body;
    if (!referenceNumber || !parentPhone) {
      return res.status(400).json({ error: 'Reference number and phone number are required' });
    }

    const ref = referenceNumber.trim().toUpperCase();
    const phone = parentPhone.trim();

    const application = await prisma.studentApplication.findFirst({
      where: {
        referenceNumber: ref,
        OR: [
          { parentPhone: phone },
          { guardianPhone: phone },
          { fatherPhone: phone },
          { motherPhone: phone },
        ],
      },
      include: {
        statusLogs: {
          where: { adminName: { not: 'System' } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found. Check your reference and phone number.' });
    }

    const latestUpdate = application.statusLogs[0];

    res.json({
      referenceNumber: application.referenceNumber,
      studentFirstName: application.studentFirstName,
      studentLastName: application.studentLastName,
      level: application.level,
      status: application.status,
      submittedAt: application.submittedAt,
      reviewedAt: application.reviewedAt,
      levelLabel: LEVEL_MAP[application.level],
      studentName: `${application.studentFirstName} ${application.studentLastName}`,
      latestComment: latestUpdate?.comment || null,
      latestCommentAt: latestUpdate?.createdAt || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to track application' });
  }
});

router.get('/', authRequired, async (req, res) => {
  try {
    const { status } = req.query;
    const applications = await prisma.studentApplication.findMany({
      where: status ? { status } : {},
      orderBy: { submittedAt: 'desc' },
    });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.get('/:id', authRequired, async (req, res) => {
  try {
    const application = await prisma.studentApplication.findUnique({
      where: { id: req.params.id },
      include: {
        statusLogs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ ...application, levelLabel: LEVEL_MAP[application.level] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

router.put('/:id', authRequired, async (req, res) => {
  try {
    const { status, adminNotes, statusComment } = req.body;

    const existing = await prisma.studentApplication.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ error: 'Application not found' });

    const statusChanged = status && status !== existing.status;

    if (statusChanged && !statusComment?.trim()) {
      return res.status(400).json({
        error: 'A comment is required when changing the application status.',
      });
    }

    const data = {};
    if (adminNotes !== undefined) data.adminNotes = adminNotes;
    if (statusChanged) {
      data.status = status;
      data.reviewedAt = new Date();
    }

    const application = await prisma.$transaction(async (tx) => {
      await tx.studentApplication.update({
        where: { id: req.params.id },
        data,
      });

      if (statusChanged) {
        await tx.applicationStatusLog.create({
          data: {
            applicationId: req.params.id,
            status,
            comment: statusComment.trim(),
            adminName: req.user.name || req.user.email,
          },
        });
      }

      return tx.studentApplication.findUnique({
        where: { id: req.params.id },
        include: { statusLogs: { orderBy: { createdAt: 'desc' } } },
      });
    });

    res.json({ ...application, levelLabel: LEVEL_MAP[application.level] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    await prisma.studentApplication.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
