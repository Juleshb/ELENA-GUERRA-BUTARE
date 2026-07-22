import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import RwandaAddressFields from '../components/forms/RwandaAddressFields';
import { Field, inputClass } from '../components/admin/FormModal';
import { apiUrl } from '../lib/apiConfig';
import {
  ATTENDANCE_TYPES,
  FUNDING_SOURCES,
  LEVELS,
  STEPS,
  GUARDIAN_TYPES,
  YES_NO,
  buildApplicationFormData,
  initialForm,
  resolveGuardianDetails,
  validateApplicationStep,
} from '../lib/applicationForm';

function SectionTitle({ children }) {
  return <h2 className="text-lg font-bold text-rw-navy border-b border-slate-100 pb-2">{children}</h2>;
}

function RadioRow({ label, name, value, options, onChange }) {
  return (
    <Field label={`${label} *`}>
      <div className="flex flex-wrap gap-4">
        {options.map((opt) => (
          <label key={opt.value} className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange(e.target.value)}
              required
            />
            {opt.label}
          </label>
        ))}
      </div>
    </Field>
  );
}

export default function ApplyOnline() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({
    birthCertificate: null,
    reportCard: null,
    studentPhoto: null,
    paymentSlip: null,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validateStep = () => {
    const message = validateApplicationStep(step, form, files);
    if (message) {
      setError(message);
      return false;
    }
    setError('');
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(apiUrl('/applications'), {
        method: 'POST',
        body: buildApplicationFormData(form, files),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Submission failed');
      navigate('/apply/success', {
        state: {
          referenceNumber: json.referenceNumber,
          levelLabel: json.levelLabel,
          studentName: `${form.studentFirstName} ${form.studentLastName}`,
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Application Form"
        subtitle="Official C.S Elena Guerra online application — all fields required as on the paper form"
        breadcrumbs={[
          { to: '/admissions', label: 'Admissions' },
          { label: 'Apply Online' },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <div className="flex justify-between mb-10 relative overflow-x-auto">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-10 min-w-[32rem]" />
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-col items-center flex-1 min-w-[4.5rem]">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 bg-white ${
                  i <= step ? 'border-rw-navy text-rw-navy' : 'border-slate-300 text-slate-400'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-[10px] mt-2 font-medium text-center hidden sm:block ${
                  i <= step ? 'text-rw-navy' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <SectionTitle>Section A — Applicant (Student) Information</SectionTitle>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First Name *">
                  <input className={inputClass} value={form.studentFirstName} onChange={(e) => update('studentFirstName', e.target.value)} required />
                </Field>
                <Field label="Last Name *">
                  <input className={inputClass} value={form.studentLastName} onChange={(e) => update('studentLastName', e.target.value)} required />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Date of Birth *">
                  <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} required />
                </Field>
                <RadioRow label="Gender" name="gender" value={form.gender} options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} onChange={(v) => update('gender', v)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nationality *">
                  <input className={inputClass} value={form.nationality} onChange={(e) => update('nationality', e.target.value)} required />
                </Field>
                <Field label="Residence Status *">
                  <input className={inputClass} value={form.residenceStatus} onChange={(e) => update('residenceStatus', e.target.value)} placeholder="e.g. Rwandan resident" required />
                </Field>
              </div>
              <Field label="Mother Tongue *">
                <input className={inputClass} value={form.motherTongue} onChange={(e) => update('motherTongue', e.target.value)} required />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Previous Student Code *">
                  <input className={inputClass} value={form.previousStudentCode} onChange={(e) => update('previousStudentCode', e.target.value)} required />
                </Field>
                <Field label="Previous Student Code Year *">
                  <input className={inputClass} value={form.previousStudentCodeYear} onChange={(e) => update('previousStudentCodeYear', e.target.value)} placeholder="e.g. 2024" required />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Previous School Code *">
                  <input className={inputClass} value={form.previousSchoolCode} onChange={(e) => update('previousSchoolCode', e.target.value)} required />
                </Field>
                <Field label="Previous School Code Year *">
                  <input className={inputClass} value={form.previousSchoolCodeYear} onChange={(e) => update('previousSchoolCodeYear', e.target.value)} required />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Previous Class Attended *">
                  <input className={inputClass} value={form.previousClassAttended} onChange={(e) => update('previousClassAttended', e.target.value)} placeholder="e.g. P6, S3" required />
                </Field>
                <Field label="Class Applied For *">
                  <input className={inputClass} value={form.classAppliedFor} onChange={(e) => update('classAppliedFor', e.target.value)} placeholder="e.g. P1, S1" required />
                </Field>
              </div>
              <RadioRow label="Day or Boarding" name="attendanceType" value={form.attendanceType} options={ATTENDANCE_TYPES} onChange={(v) => update('attendanceType', v)} />
              <Field label="Study Level *">
                <select className={inputClass} value={form.level} onChange={(e) => update('level', e.target.value)} required>
                  <option value="">Select level</option>
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </Field>
              <RwandaAddressFields form={form} update={update} />
              <Field label="Religion *">
                <input className={inputClass} value={form.religion} onChange={(e) => update('religion', e.target.value)} required />
              </Field>
              <Field label="Who pays school fees? *">
                <select className={inputClass} value={form.fundingSource} onChange={(e) => update('fundingSource', e.target.value)} required>
                  <option value="">Select</option>
                  {FUNDING_SOURCES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <SectionTitle>Section B — Parents &amp; Guardian</SectionTitle>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-rw-navy">Father&apos;s Information</h3>
                <Field label="Father's Name *">
                  <input className={inputClass} value={form.fatherName} onChange={(e) => update('fatherName', e.target.value)} required />
                </Field>
                <RadioRow label="Is Father Alive?" name="fatherAlive" value={form.fatherAlive} options={YES_NO} onChange={(v) => update('fatherAlive', v)} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Phone Number *">
                    <input className={inputClass} value={form.fatherPhone} onChange={(e) => update('fatherPhone', e.target.value)} required />
                  </Field>
                  <Field label="Father's ID *">
                    <input className={inputClass} value={form.fatherId} onChange={(e) => update('fatherId', e.target.value)} required />
                  </Field>
                </div>
                <Field label="Father's Current Occupation and Workplace *">
                  <textarea className={inputClass} rows={3} value={form.fatherOccupation} onChange={(e) => update('fatherOccupation', e.target.value)} placeholder="Be specific even if self-employed" required />
                </Field>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-rw-navy">Mother&apos;s Information</h3>
                <Field label="Mother's Name *">
                  <input className={inputClass} value={form.motherName} onChange={(e) => update('motherName', e.target.value)} required />
                </Field>
                <RadioRow label="Is Mother Alive?" name="motherAlive" value={form.motherAlive} options={YES_NO} onChange={(v) => update('motherAlive', v)} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Phone Number *">
                    <input className={inputClass} value={form.motherPhone} onChange={(e) => update('motherPhone', e.target.value)} required />
                  </Field>
                  <Field label="Mother's ID *">
                    <input className={inputClass} value={form.motherId} onChange={(e) => update('motherId', e.target.value)} required />
                  </Field>
                </div>
                <Field label="Home Address (Street/Avenue & Number) *">
                  <textarea className={inputClass} rows={2} value={form.motherHomeAddress} onChange={(e) => update('motherHomeAddress', e.target.value)} required />
                </Field>
                <Field label="Mother's Current Occupation and Workplace *">
                  <textarea className={inputClass} rows={3} value={form.motherOccupation} onChange={(e) => update('motherOccupation', e.target.value)} placeholder="Be specific even if self-employed" required />
                </Field>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-rw-navy">Guardian</h3>
                <RadioRow
                  label="Guardian is"
                  name="guardianType"
                  value={form.guardianType}
                  options={GUARDIAN_TYPES}
                  onChange={(v) => {
                    update('guardianType', v);
                    if (v === 'OTHER') {
                      update('guardianName', '');
                      update('guardianPhone', '');
                      update('guardianHomeAddress', '');
                      update('guardianOccupation', '');
                    }
                  }}
                />

                {(form.guardianType === 'FATHER' || form.guardianType === 'MOTHER') && (
                  <div className="rounded-xl bg-rw-blue-50 border border-rw-blue-100 p-4 text-sm space-y-1">
                    <p className="font-semibold text-rw-navy">
                      Guardian: {form.guardianType === 'FATHER' ? 'Father' : 'Mother'}
                    </p>
                    <p>
                      <span className="text-slate-500">Name:</span>{' '}
                      {form.guardianType === 'FATHER' ? form.fatherName || '—' : form.motherName || '—'}
                    </p>
                    <p>
                      <span className="text-slate-500">Phone:</span>{' '}
                      {form.guardianType === 'FATHER' ? form.fatherPhone || '—' : form.motherPhone || '—'}
                    </p>
                    <p>
                      <span className="text-slate-500">Home address:</span> {form.motherHomeAddress || '—'}
                    </p>
                    <p>
                      <span className="text-slate-500">Occupation:</span>{' '}
                      {form.guardianType === 'FATHER' ? form.fatherOccupation || '—' : form.motherOccupation || '—'}
                    </p>
                    {form.guardianType === 'FATHER' && (
                      <p className="text-xs text-slate-500 mt-2">
                        Father&apos;s home address uses the mother&apos;s home address on the form.
                      </p>
                    )}
                  </div>
                )}

                {(form.guardianType === 'FATHER' || form.guardianType === 'MOTHER') && (
                  <Field label="Guardian Email Address *">
                    <input
                      type="email"
                      className={inputClass}
                      value={form.guardianEmail}
                      onChange={(e) => update('guardianEmail', e.target.value)}
                      placeholder="Email for school contact about this application"
                      required
                    />
                  </Field>
                )}

                {form.guardianType === 'OTHER' && (
                  <>
                    <Field label="Guardian's Name *">
                      <input className={inputClass} value={form.guardianName} onChange={(e) => update('guardianName', e.target.value)} required />
                    </Field>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Phone Number *">
                        <input className={inputClass} value={form.guardianPhone} onChange={(e) => update('guardianPhone', e.target.value)} required />
                      </Field>
                      <Field label="Email Address *">
                        <input type="email" className={inputClass} value={form.guardianEmail} onChange={(e) => update('guardianEmail', e.target.value)} required />
                      </Field>
                    </div>
                    <Field label="Home Address (Street/Avenue & Number) *">
                      <textarea className={inputClass} rows={2} value={form.guardianHomeAddress} onChange={(e) => update('guardianHomeAddress', e.target.value)} required />
                    </Field>
                    <Field label="Guardian's Current Occupation and Workplace *">
                      <textarea className={inputClass} rows={3} value={form.guardianOccupation} onChange={(e) => update('guardianOccupation', e.target.value)} placeholder="Be specific even if self-employed" required />
                    </Field>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <SectionTitle>Section C — Other Information</SectionTitle>
              <Field label="Health and Medical Background *">
                <textarea className={inputClass} rows={4} value={form.healthMedicalBackground} onChange={(e) => update('healthMedicalBackground', e.target.value)} placeholder="Indicate any specific deficiency or health problem, or write None" required />
              </Field>
              <p className="text-sm font-semibold text-rw-navy">Emergency Contact (other person to contact in case of emergency)</p>
              <Field label="Full Name *">
                <input className={inputClass} value={form.emergencyContactName} onChange={(e) => update('emergencyContactName', e.target.value)} required />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone Number *">
                  <input className={inputClass} value={form.emergencyContactPhone} onChange={(e) => update('emergencyContactPhone', e.target.value)} required />
                </Field>
                <Field label="Home Address *">
                  <input className={inputClass} value={form.emergencyContactAddress} onChange={(e) => update('emergencyContactAddress', e.target.value)} required />
                </Field>
              </div>
              <div className="space-y-3 p-4 rounded-xl bg-red-50 border border-red-100 text-sm">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.agreePhotoUse} onChange={(e) => update('agreePhotoUse', e.target.checked)} className="mt-1" />
                  <span className="text-red-800">
                    I understand that photos of students taken by the school may be used in school advertisements.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.agreeFeesNonRefundable} onChange={(e) => update('agreeFeesNonRefundable', e.target.checked)} className="mt-1" />
                  <span className="text-red-800">I understand that school fees are not refundable.</span>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <SectionTitle>Upload Documents</SectionTitle>
              <p className="text-slate-600 text-sm">All documents are required. PDF or images only (max 5MB each).</p>
              <div className="p-4 rounded-xl bg-rw-gold-400/15 border border-rw-gold-400/40 text-sm">
                <p className="font-semibold text-rw-navy">Registration fee payment slip *</p>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" required className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-800 file:font-medium" onChange={(e) => setFiles((f) => ({ ...f, paymentSlip: e.target.files?.[0] || null }))} />
                {files.paymentSlip && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle2 size={14} /> {files.paymentSlip.name}</p>}
              </div>
              {[
                { key: 'birthCertificate', label: 'Birth Certificate *' },
                { key: 'reportCard', label: 'Latest Report Card *' },
                { key: 'studentPhoto', label: 'Passport Photo *' },
              ].map(({ key, label }) => (
                <Field key={key} label={label}>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" required className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-rw-blue-50 file:text-rw-blue-700 file:font-medium" onChange={(e) => setFiles((f) => ({ ...f, [key]: e.target.files?.[0] || null }))} />
                  {files[key] && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle2 size={14} /> {files[key].name}</p>}
                </Field>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <SectionTitle>Review &amp; Submit</SectionTitle>
              <div className="bg-slate-50 rounded-xl p-5 text-sm space-y-2 border border-slate-100">
                <p><span className="text-slate-500">Student:</span> <strong>{form.studentFirstName} {form.studentLastName}</strong></p>
                <p><span className="text-slate-500">Class applied for:</span> <strong>{form.classAppliedFor}</strong> ({form.attendanceType})</p>
                <p><span className="text-slate-500">Address:</span> <strong>{[form.country === 'OTHER' ? 'Other' : 'Rwanda', form.province, form.district, form.sector, form.cell, form.village].filter(Boolean).join(', ')}</strong></p>
                <p><span className="text-slate-500">Father:</span> <strong>{form.fatherName}</strong> — {form.fatherPhone}</p>
                <p><span className="text-slate-500">Mother:</span> <strong>{form.motherName}</strong> — {form.motherPhone}</p>
                <p><span className="text-slate-500">Guardian:</span> <strong>{GUARDIAN_TYPES.find((g) => g.value === form.guardianType)?.label || '—'}</strong> — {resolveGuardianDetails(form).guardianName} ({resolveGuardianDetails(form).guardianPhone})</p>
                <p><span className="text-slate-500">Emergency:</span> <strong>{form.emergencyContactName}</strong> — {form.emergencyContactPhone}</p>
              </div>
              <p className="text-sm text-slate-600">
                Done at <strong>HUYE</strong> on {new Date().toLocaleDateString('en-GB')}
              </p>
              <Field label="Parent or Guardian's Name (Signature) *">
                <input className={inputClass} value={form.signatureName} onChange={(e) => update('signatureName', e.target.value)} placeholder="Type full name as signature" required />
              </Field>
              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input type="checkbox" checked={form.agreeTerms} onChange={(e) => update('agreeTerms', e.target.checked)} className="mt-1" />
                <span className="text-slate-700">
                  I confirm that all information provided is accurate. False information may lead to rejection. Submission does not guarantee admission.
                </span>
              </label>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            {step > 0 ? (
              <button type="button" onClick={back} className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 inline-flex items-center gap-1">
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <Link to="/admissions" className="px-5 py-2.5 text-slate-600 text-sm font-medium hover:text-rw-blue-600 inline-flex items-center gap-1">
                <ArrowLeft size={16} /> Admissions info
              </Link>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="px-6 py-2.5 bg-rw-navy text-white rounded-xl text-sm font-semibold hover:bg-rw-blue-800 ml-auto inline-flex items-center gap-1">
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-brand-red-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-red-700 ml-auto disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already applied?{' '}
          <Link to="/apply/track" className="text-rw-blue-600 font-semibold hover:underline">Track your application</Link>
        </p>
      </div>
    </>
  );
}
