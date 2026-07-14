import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Field, inputClass } from '../../components/admin/FormModal';
import { resolveLogoUrl } from '../../lib/brand';
import { AdminButton, AdminCard, AdminSection } from '../../components/admin/AdminUI';

export default function AdminSettings() {
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then((res) => setForm(res.data));
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    await api.put('/settings', form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-4">
      <AdminSection title="General" description="School name, tagline, and logo">
        <div className="grid gap-4">
          <Field label="School Name">
            <input className={inputClass} value={form.schoolName || ''} onChange={(e) => update('schoolName', e.target.value)} />
          </Field>
          <Field label="Tagline">
            <input className={inputClass} value={form.tagline || ''} onChange={(e) => update('tagline', e.target.value)} />
          </Field>
          <Field label="Logo URL">
            <input
              className={inputClass}
              value={form.logoUrl || '/logo.jpg'}
              onChange={(e) => update('logoUrl', e.target.value)}
              placeholder="/logo.jpg"
            />
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block">
              <img src={resolveLogoUrl(form.logoUrl)} alt="Logo preview" className="h-20 w-20 object-contain" />
            </div>
          </Field>
        </div>
      </AdminSection>

      <AdminSection title="Hero section" description="Homepage video and welcome text">
        <div className="grid gap-4">
          <Field label="Hero Title">
            <input className={inputClass} value={form.heroTitle || ''} onChange={(e) => update('heroTitle', e.target.value)} />
          </Field>
          <Field label="Hero Subtitle">
            <textarea className={inputClass} rows={2} value={form.heroSubtitle || ''} onChange={(e) => update('heroSubtitle', e.target.value)} />
          </Field>
          <Field label="Hero Video URL">
            <input
              className={inputClass}
              value={form.heroImageUrl || ''}
              onChange={(e) => update('heroImageUrl', e.target.value)}
              placeholder="https://youtu.be/... or /hero.mp4"
            />
            <p className="text-xs text-slate-500 mt-1">
              YouTube link or MP4 path/URL. Leave empty for default.
            </p>
          </Field>
        </div>
      </AdminSection>

      <AdminSection title="About" description="Mission, vision, and about content">
        <div className="grid gap-4">
          <Field label="About (HTML allowed)">
            <textarea className={inputClass} rows={4} value={form.about || ''} onChange={(e) => update('about', e.target.value)} />
          </Field>
          <Field label="Mission">
            <textarea className={inputClass} rows={2} value={form.mission || ''} onChange={(e) => update('mission', e.target.value)} />
          </Field>
          <Field label="Vision">
            <textarea className={inputClass} rows={2} value={form.vision || ''} onChange={(e) => update('vision', e.target.value)} />
          </Field>
        </div>
      </AdminSection>

      <AdminSection title="Contact" description="Public contact details">
        <div className="grid gap-4">
          <Field label="Address">
            <input className={inputClass} value={form.address || ''} onChange={(e) => update('address', e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputClass} type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} />
          </Field>
        </div>
      </AdminSection>

      <AdminCard className="flex items-center gap-4">
        <AdminButton type="submit" variant="primary">
          Save settings
        </AdminButton>
        {saved && <span className="text-emerald-600 text-sm font-medium">Settings saved successfully.</span>}
      </AdminCard>
    </form>
  );
}
