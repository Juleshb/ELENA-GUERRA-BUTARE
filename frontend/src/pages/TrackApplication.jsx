import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import Seo from '../components/Seo';
import { Field, inputClass } from '../components/admin/FormModal';

const STATUS_STYLES = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: 'Pending Review' },
  UNDER_REVIEW: { bg: 'bg-rw-blue-50', text: 'text-rw-blue-800', border: 'border-rw-blue-200', label: 'Under Review' },
  ACCEPTED: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', label: 'Accepted' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', label: 'Not Accepted' },
  WAITLISTED: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', label: 'Waitlisted' },
};

export default function TrackApplication() {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.post('/applications/track', {
        referenceNumber: referenceNumber.trim().toUpperCase(),
        parentPhone: parentPhone.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not find application');
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = result ? STATUS_STYLES[result.status] || STATUS_STYLES.PENDING : null;

  return (
    <>
      <Seo
        title="Track Application"
        description="Track your C.S Elena Guerra Butare admissions application status with your reference number."
        path="/apply/track"
      />
      <PageHeader
        title="Track Application"
        subtitle="Check the status of your submitted application"
        breadcrumbs={[
          { to: '/admissions', label: 'Admissions' },
          { label: 'Track' },
        ]}
      />
      <div className="max-w-lg mx-auto px-4 py-10 md:py-14">
        <form
          onSubmit={handleTrack}
          className="bg-white rounded-xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-4"
        >
          <Field label="Reference Number *">
            <input
              className={inputClass}
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. SH-2026-12345"
              required
            />
          </Field>
          <Field label="Phone Number Used on Application *">
            <input
              className={inputClass}
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="Guardian, father, or mother phone from the form"
              required
            />
          </Field>
          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rw-blue-600 text-white rounded-lg font-semibold hover:bg-rw-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track Status'}
          </button>
        </form>

        {result && statusStyle && (
          <div className="mt-8 bg-white rounded-xl border p-6 shadow-sm">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-sm text-slate-500">Applicant</p>
                <p className="font-bold text-rw-navy text-lg">{result.studentName}</p>
                <p className="text-sm text-slate-600 mt-1">{result.levelLabel}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                {statusStyle.label}
              </span>
            </div>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Reference</dt>
                <dd className="font-mono font-semibold">{result.referenceNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Submitted</dt>
                <dd>{new Date(result.submittedAt).toLocaleDateString()}</dd>
              </div>
              {result.reviewedAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Last updated</dt>
                  <dd>{new Date(result.reviewedAt).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
            {result.latestComment && (
              <div className="mt-6 p-4 rounded-lg bg-rw-blue-50 border border-rw-blue-100">
                <p className="text-xs font-semibold text-rw-blue-800 uppercase tracking-wide mb-1">
                  Message from Admissions
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{result.latestComment}</p>
                {result.latestCommentAt && (
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(result.latestCommentAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-center text-sm text-slate-500 mt-8">
          Haven&apos;t applied yet?{' '}
          <Link to="/apply" className="text-rw-blue-600 font-semibold hover:underline">
            Submit online application
          </Link>
        </p>
      </div>
    </>
  );
}
