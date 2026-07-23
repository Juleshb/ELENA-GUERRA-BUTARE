import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import Seo from '../components/Seo';
import { IconBox } from '../components/ui/IconBox';
import { Field, inputClass } from '../components/admin/FormModal';
import { OtpLogin } from './MyMessages';
import { usePortalAuth } from '../context/PortalAuthContext';

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select a topic (optional)' },
  { value: 'General inquiry', label: 'General inquiry' },
  { value: 'Admissions', label: 'Admissions' },
  { value: 'Fees & payments', label: 'Fees & payments' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'Other', label: 'Other' },
];

export default function Contact() {
  const { settings } = useOutletContext();
  const { isAuthenticated } = usePortalAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    createAccount: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingAccount, setPendingAccount] = useState(null);
  const [accountVerified, setAccountVerified] = useState(false);

  const update = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/contact', form);
      setSuccessMessage(res.data.message);
      setSuccess(true);
      if (res.data.needsOtpVerification) {
        setPendingAccount({
          email: res.data.email,
          name: res.data.name,
          phone: res.data.phone,
          messageId: res.data.id,
          otpSent: res.data.otpSent,
        });
      } else if (res.data.hasAccount) {
        setPendingAccount({ hasAccount: true, email: res.data.email });
      }
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        createAccount: true,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setSuccessMessage('');
    setPendingAccount(null);
    setAccountVerified(false);
  };

  return (
    <>
      <Seo
        title="Contact Us"
        description="Contact C.S Elena Guerra Butare — address, phone, email, and online enquiry form for admissions and school information."
        path="/contact"
      />
      <PageHeader
        title="Contact Us"
        subtitle="We are here to answer your questions"
        breadcrumbs={[{ label: 'Contact' }]}
      />
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {settings?.address && (
              <ContactCard icon={MapPin} title="Address" value={settings.address} />
            )}
            {settings?.phone && (
              <ContactCard
                icon={Phone}
                title="Phone"
                value={
                  <a href={`tel:${settings.phone}`} className="hover:text-rw-blue-600 transition">
                    {settings.phone}
                  </a>
                }
              />
            )}
            {settings?.email && (
              <ContactCard
                icon={Mail}
                title="Email"
                value={
                  <a href={`mailto:${settings.email}`} className="hover:text-rw-blue-600 transition">
                    {settings.email}
                  </a>
                }
              />
            )}
            {isAuthenticated && (
              <Link
                to="/my-messages"
                className="flex gap-4 p-5 md:p-6 bg-rw-blue-50 rounded-xl border border-rw-blue-200 card-hover"
              >
                <IconBox icon={MessageCircle} />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-rw-blue-600 mb-1">
                    Your account
                  </div>
                  <div className="text-rw-navy font-medium text-sm">
                    View your conversations and chat with our team →
                  </div>
                </div>
              </Link>
            )}
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-rw-navy mb-1">Send a Message</h2>
              <p className="text-slate-600 text-sm mb-6">
                Fill in the form below and our team will get back to you as soon as possible.
                You will receive an automatic thank-you email when your message is submitted.
              </p>

              {success ? (
                <div className="space-y-6">
                  <div className="rounded-xl bg-rw-green-50 border border-rw-green-200 p-6 md:p-8 text-center">
                    <CheckCircle2
                      size={48}
                      className="text-rw-green-600 mx-auto mb-3"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <h3 className="font-bold text-rw-navy text-xl mb-2">
                      Thank you for reaching out to us!
                    </h3>
                    <p className="text-slate-600 text-sm mb-3 max-w-md mx-auto leading-relaxed">
                      {successMessage ||
                        'We have received your message and appreciate you contacting our school.'}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Please check your email inbox (and spam folder) for our automatic confirmation.
                      Our team will reply personally as soon as possible.
                    </p>
                  </div>

                  {pendingAccount?.hasAccount && !isAuthenticated && (
                    <div className="rounded-xl bg-rw-blue-50 border border-rw-blue-200 p-5 text-center">
                      <p className="text-sm text-slate-700 mb-3">
                        You already have an account with <strong>{pendingAccount.email}</strong>.
                        Sign in to continue the conversation in chat.
                      </p>
                      <Link
                        to="/my-messages"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-rw-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-rw-blue-700"
                      >
                        <MessageCircle size={16} /> Go to My Messages
                      </Link>
                    </div>
                  )}

                  {pendingAccount?.messageId && !accountVerified && !isAuthenticated && (
                    <div>
                      {!pendingAccount.otpSent && (
                        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                          We could not send a verification email right now. Use the button below to
                          request a code.
                        </p>
                      )}
                      <OtpLogin
                        embedded
                        defaultEmail={pendingAccount.email}
                        defaultName={pendingAccount.name}
                        messageId={pendingAccount.messageId}
                        purpose="REGISTER"
                        startAtCode={pendingAccount.otpSent}
                        onSuccess={() => setAccountVerified(true)}
                      />
                    </div>
                  )}

                  {(accountVerified || isAuthenticated) && pendingAccount && (
                    <div className="rounded-xl bg-rw-green-50 border border-rw-green-200 p-5 text-center">
                      <p className="text-sm text-slate-700 mb-3">
                        Your account is ready! You can now chat with our team directly in the portal.
                      </p>
                      <Link
                        to="/my-messages"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-red-700"
                      >
                        <MessageCircle size={16} /> Open My Messages
                      </Link>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-rw-blue-600 font-semibold text-sm hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                      {error}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full name *">
                      <input
                        type="text"
                        required
                        minLength={2}
                        value={form.name}
                        onChange={update('name')}
                        className={inputClass}
                        placeholder="Your name"
                      />
                    </Field>
                    <Field label="Email *">
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={update('email')}
                        className={inputClass}
                        placeholder="you@example.com"
                      />
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Phone">
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={update('phone')}
                        className={inputClass}
                        placeholder="+250 7XX XXX XXX"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Optional — receive confirmation and replies via SMS or WhatsApp
                      </p>
                    </Field>
                    <Field label="Subject">
                      <select
                        value={form.subject}
                        onChange={update('subject')}
                        className={inputClass}
                      >
                        {SUBJECT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Message *">
                    <textarea
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={5}
                      value={form.message}
                      onChange={update('message')}
                      className={inputClass}
                      placeholder="How can we help you?"
                    />
                    <p className="text-xs text-slate-400 mt-1">{form.message.length} / 5000</p>
                  </Field>

                  <label className="flex items-start gap-3 p-4 rounded-lg bg-rw-blue-50/80 border border-rw-blue-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.createAccount}
                      onChange={update('createAccount')}
                      className="mt-1 rounded border-slate-300 text-rw-blue-600 focus:ring-rw-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      <strong className="text-rw-navy">Create a free account</strong> — verify your
                      email with a one-time code and chat with our team directly in the portal (no
                      password needed).
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-sm bg-rw-green-600 text-white hover:bg-rw-green-700 transition shadow-md disabled:opacity-60"
                  >
                    <Send size={18} />
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ContactCard({ icon: Icon, title, value }) {
  return (
    <div className="flex gap-4 p-5 md:p-6 bg-white rounded-xl border border-slate-200/80 card-hover">
      <IconBox icon={Icon} />
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-rw-green-600 mb-1">
          {title}
        </div>
        <div className="text-rw-navy font-medium">{value}</div>
      </div>
    </div>
  );
}
