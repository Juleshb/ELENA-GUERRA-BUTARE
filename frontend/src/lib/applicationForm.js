export const LEVELS = [
  { value: 'PRIMARY', label: 'Primary (P1 – P6)' },
  { value: 'ORDINARY_LEVEL', label: 'Ordinary Level (S1 – S3)' },
  { value: 'ADVANCED_LEVEL', label: 'Advanced Level (S4 – S6)' },
];

export const STEPS = [
  'Student',
  'Parents & Guardian',
  'Other Info',
  'Documents',
  'Review',
];

export const YES_NO = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
];

export const ATTENDANCE_TYPES = [
  { value: 'DAY', label: 'Day' },
  { value: 'BOARDING', label: 'Boarding' },
];

export const FUNDING_SOURCES = [
  { value: 'PARENTS', label: 'Parents' },
  { value: 'BURSARY', label: 'Bursary / Scholarship' },
  { value: 'OTHER', label: 'Other' },
];

export const GUARDIAN_TYPES = [
  { value: 'FATHER', label: 'Father' },
  { value: 'MOTHER', label: 'Mother' },
  { value: 'OTHER', label: 'Other person' },
];

export const initialForm = {
  studentFirstName: '',
  studentLastName: '',
  dateOfBirth: '',
  gender: '',
  nationality: '',
  residenceStatus: '',
  motherTongue: '',
  previousStudentCode: '',
  previousStudentCodeYear: '',
  previousSchoolCode: '',
  previousSchoolCodeYear: '',
  previousClassAttended: '',
  classAppliedFor: '',
  attendanceType: '',
  level: '',
  country: 'RWANDA',
  province: '',
  district: '',
  sector: '',
  cell: '',
  village: '',
  religion: '',
  fundingSource: '',
  fatherName: '',
  fatherAlive: '',
  fatherPhone: '',
  fatherId: '',
  fatherOccupation: '',
  motherName: '',
  motherAlive: '',
  motherPhone: '',
  motherId: '',
  motherHomeAddress: '',
  motherOccupation: '',
  guardianType: '',
  guardianName: '',
  guardianPhone: '',
  guardianEmail: '',
  guardianHomeAddress: '',
  guardianOccupation: '',
  healthMedicalBackground: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactAddress: '',
  agreePhotoUse: false,
  agreeFeesNonRefundable: false,
  signatureName: '',
  agreeTerms: false,
};

export function resolveGuardianDetails(form) {
  const t = (v) => (typeof v === 'string' ? v.trim() : '');

  if (form.guardianType === 'FATHER') {
    return {
      guardianType: 'FATHER',
      guardianName: t(form.fatherName),
      guardianPhone: t(form.fatherPhone),
      guardianEmail: t(form.guardianEmail),
      guardianHomeAddress: t(form.motherHomeAddress),
      guardianOccupation: t(form.fatherOccupation),
      parentRelation: 'Father',
    };
  }

  if (form.guardianType === 'MOTHER') {
    return {
      guardianType: 'MOTHER',
      guardianName: t(form.motherName),
      guardianPhone: t(form.motherPhone),
      guardianEmail: t(form.guardianEmail),
      guardianHomeAddress: t(form.motherHomeAddress),
      guardianOccupation: t(form.motherOccupation),
      parentRelation: 'Mother',
    };
  }

  return {
    guardianType: 'OTHER',
    guardianName: t(form.guardianName),
    guardianPhone: t(form.guardianPhone),
    guardianEmail: t(form.guardianEmail),
    guardianHomeAddress: t(form.guardianHomeAddress),
    guardianOccupation: t(form.guardianOccupation),
    parentRelation: 'Guardian',
  };
}

export function withSyncedGuardian(form) {
  const resolved = resolveGuardianDetails(form);
  return {
    ...form,
    guardianType: form.guardianType,
    guardianName: resolved.guardianName,
    guardianPhone: resolved.guardianPhone,
    guardianHomeAddress: resolved.guardianHomeAddress,
    guardianOccupation: resolved.guardianOccupation,
  };
}

export function validateApplicationStep(step, form, files) {
  const t = (v) => (typeof v === 'string' ? v.trim() : '');

  if (step === 0) {
    const fields = [
      ['studentFirstName', 'first name'],
      ['studentLastName', 'last name'],
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
      ['level', 'study level'],
      ['country', 'country'],
      ['province', 'province'],
      ['district', 'district'],
      ['sector', 'sector'],
      ['cell', 'cell'],
      ['village', 'village'],
      ['religion', 'religion'],
      ['fundingSource', 'who pays school fees'],
    ];
    const missing = fields.filter(([key]) => !t(form[key])).map(([, label]) => label);
    if (missing.length) return `Please complete all student fields: ${missing.join(', ')}.`;
  }

  if (step === 1) {
    const synced = withSyncedGuardian(form);
    const fields = [
      ['fatherName', "father's name"],
      ['fatherAlive', 'whether father is alive'],
      ['fatherPhone', "father's phone"],
      ['fatherId', "father's ID"],
      ['fatherOccupation', "father's occupation and workplace"],
      ['motherName', "mother's name"],
      ['motherAlive', 'whether mother is alive'],
      ['motherPhone', "mother's phone"],
      ['motherId', "mother's ID"],
      ['motherHomeAddress', "mother's home address"],
      ['motherOccupation', "mother's occupation and workplace"],
      ['guardianType', 'who is the guardian'],
      ['guardianEmail', 'guardian email'],
    ];
    const missing = fields.filter(([key]) => !t(form[key])).map(([, label]) => label);

    if (form.guardianType === 'OTHER') {
      const otherFields = [
        ['guardianName', "guardian's name"],
        ['guardianPhone', "guardian's phone"],
        ['guardianHomeAddress', "guardian's home address"],
        ['guardianOccupation', "guardian's occupation and workplace"],
      ];
      missing.push(...otherFields.filter(([key]) => !t(synced[key])).map(([, label]) => label));
    } else if (form.guardianType === 'FATHER' || form.guardianType === 'MOTHER') {
      const resolved = resolveGuardianDetails(form);
      if (!resolved.guardianName || !resolved.guardianPhone) {
        missing.push('complete parent details for the selected guardian');
      }
    }

    if (missing.length) return `Please complete all parents & guardian fields: ${missing.join(', ')}.`;
  }

  if (step === 2) {
    const fields = [
      ['healthMedicalBackground', 'health and medical background'],
      ['emergencyContactName', 'emergency contact full name'],
      ['emergencyContactPhone', 'emergency contact phone'],
      ['emergencyContactAddress', 'emergency contact home address'],
    ];
    const missing = fields.filter(([key]) => !t(form[key])).map(([, label]) => label);
    if (!form.agreePhotoUse) missing.push('photo use consent');
    if (!form.agreeFeesNonRefundable) missing.push('non-refundable fees acknowledgment');
    if (missing.length) return `Please complete section C: ${missing.join(', ')}.`;
  }

  if (step === 3) {
    const missing = [];
    if (!files.paymentSlip) missing.push('payment slip');
    if (!files.birthCertificate) missing.push('birth certificate');
    if (!files.reportCard) missing.push('report card');
    if (!files.studentPhoto) missing.push('passport photo');
    if (missing.length) return `Please upload all required documents: ${missing.join(', ')}.`;
  }

  if (step === 4) {
    if (!t(form.signatureName)) return 'Please enter the parent/guardian name for signature.';
    if (!form.agreeTerms) return 'You must confirm the information is accurate before submitting.';
  }

  return '';
}

export function buildApplicationFormData(form, files) {
  const data = new FormData();
  const guardian = resolveGuardianDetails(form);
  const payload = {
    ...form,
    ...guardian,
    previousSchool: form.previousSchoolCode,
    currentGrade: form.previousClassAttended,
    parentName: guardian.guardianName,
    parentPhone: guardian.guardianPhone,
    parentEmail: guardian.guardianEmail,
    parentRelation: guardian.parentRelation,
    address: guardian.guardianHomeAddress,
    additionalNotes: form.healthMedicalBackground,
    submittedAtLocation: 'HUYE',
    agreePhotoUse: form.agreePhotoUse ? 'true' : 'false',
    agreeFeesNonRefundable: form.agreeFeesNonRefundable ? 'true' : 'false',
  };

  Object.entries(payload).forEach(([key, value]) => {
    if (key !== 'agreeTerms') data.append(key, value ?? '');
  });

  data.append('birthCertificate', files.birthCertificate);
  data.append('reportCard', files.reportCard);
  data.append('studentPhoto', files.studentPhoto);
  data.append('paymentSlip', files.paymentSlip);

  return data;
}
