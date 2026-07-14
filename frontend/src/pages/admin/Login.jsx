import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Field, inputClass } from '../../components/admin/FormModal';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-rw-navy text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rw-blue-900/60 to-brand-red-600/15" />
        <div className="relative">
          <div className="rw-tricolor w-24 mb-8 rounded-sm" style={{ height: 6 }} />
          <img src="/logo.jpg" alt="C.S Elena Guerra" className="w-28 h-28 object-contain mb-6" />
          <h1 className="text-2xl font-bold text-rw-blue-100">C.S ELENA GUERRA</h1>
          <p className="text-brand-red-500 font-bold tracking-widest text-sm uppercase mt-1">Butare</p>
          <p className="text-blue-200 mt-4 max-w-sm leading-relaxed text-sm">
            Staff portal — manage news, events, admissions, and school content.
          </p>
        </div>
        <p className="relative text-blue-300 text-sm">
          <Link to="/" className="hover:text-rw-gold-400 transition inline-flex items-center gap-1">
            <ArrowLeft size={16} /> Back to public website
          </Link>
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center bg-[#f4f7fb] px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 w-full max-w-md"
        >
          <div className="lg:hidden rw-tricolor rounded-sm mb-6" style={{ height: 4 }} />
          <h2 className="text-2xl font-bold text-rw-navy">Staff Sign In</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">Content management portal</p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
                autoComplete="current-password"
              />
            </Field>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-rw-navy text-white rounded-xl font-semibold hover:bg-rw-blue-800 disabled:opacity-50 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <Link to="/" className="block text-center text-sm text-slate-500 mt-4 hover:text-rw-blue-600 lg:hidden">
            Back to website
          </Link>
        </form>
      </div>
    </div>
  );
}
