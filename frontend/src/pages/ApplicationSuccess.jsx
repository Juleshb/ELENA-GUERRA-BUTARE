import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';

export default function ApplicationSuccess() {
  const { state } = useLocation();

  if (!state?.referenceNumber) {
    return <Navigate to="/apply" replace />;
  }

  return (
    <>
      <PageHeader
        title="Application Submitted"
        subtitle="Your online application has been received"
        breadcrumbs={[
          { to: '/admissions', label: 'Admissions' },
          { label: 'Success' },
        ]}
      />
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-rw-green-100 text-rw-green-600 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} strokeWidth={2} aria-hidden />
        </div>
        <h2 className="text-2xl font-bold text-rw-navy">Thank you, {state.studentName}!</h2>
        <p className="text-slate-600 mt-3">
          Your application for <strong>{state.levelLabel}</strong> has been submitted successfully.
        </p>

        <div className="mt-8 p-6 bg-rw-blue-50 rounded-xl border-2 border-rw-blue-200 border-dashed">
          <p className="text-sm text-slate-600 uppercase tracking-wide font-semibold">
            Your Reference Number
          </p>
          <p className="text-3xl font-bold text-rw-blue-700 mt-2 tracking-wider">
            {state.referenceNumber}
          </p>
          <p className="text-xs text-slate-500 mt-3">
            Save this number. You will need it with your parent phone number to track your
            application status.
          </p>
        </div>

        <div className="mt-8 text-left bg-white rounded-xl border p-6 text-sm text-slate-600 space-y-2">
          <p className="font-semibold text-rw-navy">What happens next?</p>
          <p>1. The Admissions Office will review your application within 14 working days.</p>
          <p>2. You may be invited for an entrance assessment or interview.</p>
          <p>3. Results will be sent by SMS, email, and posted on the school notice board.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Button to="/apply/track">Track Application</Button>
          <Button to="/admissions" variant="secondary">
            Back to Admissions
          </Button>
        </div>
      </div>
    </>
  );
}
