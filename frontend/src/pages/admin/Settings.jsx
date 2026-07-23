import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Field, inputClass } from '../../components/admin/FormModal';
import { SingleImageUpload } from '../../components/admin/ImageUploader';
import { resolveLogoUrl } from '../../lib/brand';
import { AdminButton, AdminCard, AdminPage, AdminSection } from '../../components/admin/AdminUI';

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
    <AdminPage className="max-w-4xl">
    <form onSubmit={handleSave} className="space-y-3 sm:space-y-4">
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
            <p className="text-xs text-slate-500 mt-1">YouTube link or MP4 path/URL. Leave empty for default.</p>
          </Field>
        </div>
      </AdminSection>

      <AdminSection title="Mission, vision & motto" description="Shown on Home and About pages">
        <div className="grid gap-4">
          <Field label="Short about (homepage teaser)">
            <textarea className={inputClass} rows={3} value={form.about || ''} onChange={(e) => update('about', e.target.value)} />
          </Field>
          <Field label="Mission">
            <textarea className={inputClass} rows={4} value={form.mission || ''} onChange={(e) => update('mission', e.target.value)} />
          </Field>
          <Field label="Vision">
            <textarea className={inputClass} rows={4} value={form.vision || ''} onChange={(e) => update('vision', e.target.value)} />
          </Field>
          <Field label="School motto">
            <input className={inputClass} value={form.schoolMotto || ''} onChange={(e) => update('schoolMotto', e.target.value)} />
          </Field>
        </div>
      </AdminSection>

      <AdminSection
        title="Our story content"
        description="Full texts for About page and homepage Read more sections — edit anytime"
      >
        <div className="grid gap-4">
          <Field label="Historical background">
            <textarea
              className={inputClass}
              rows={10}
              value={form.historicalBackground || ''}
              onChange={(e) => update('historicalBackground', e.target.value)}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Principal / Headmistress title">
              <input
                className={inputClass}
                value={form.principalTitle || ''}
                onChange={(e) => update('principalTitle', e.target.value)}
                placeholder="Headmistress"
              />
            </Field>
            <Field label="Principal name">
              <input
                className={inputClass}
                value={form.principalName || ''}
                onChange={(e) => update('principalName', e.target.value)}
                placeholder="Full name"
              />
            </Field>
          </div>
          <Field label="Principal photo">
            <SingleImageUpload
              value={form.principalPhotoUrl || ''}
              onChange={(url) => update('principalPhotoUrl', url)}
              label="Principal"
            />
          </Field>
          <Field label="Principal message">
            <textarea
              className={inputClass}
              rows={10}
              value={form.principalMessage || ''}
              onChange={(e) => update('principalMessage', e.target.value)}
            />
          </Field>
          <Field label="Mother Elena Guerra photo">
            <SingleImageUpload
              value={form.motherElenaPhotoUrl || ''}
              onChange={(url) => update('motherElenaPhotoUrl', url)}
              label="Mother Elena"
            />
          </Field>
          <Field label="History of Mother Elena Guerra">
            <textarea
              className={inputClass}
              rows={12}
              value={form.motherElenaHistory || ''}
              onChange={(e) => update('motherElenaHistory', e.target.value)}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Director of Studies name">
              <input
                className={inputClass}
                value={form.directorName || ''}
                onChange={(e) => update('directorName', e.target.value)}
                placeholder="MANIRAGABA Bernard"
              />
            </Field>
          </div>
          <Field label="Director of Studies photo">
            <SingleImageUpload
              value={form.directorPhotoUrl || ''}
              onChange={(url) => update('directorPhotoUrl', url)}
              label="Director"
            />
          </Field>
          <Field label="Director of Studies welcome message">
            <textarea
              className={inputClass}
              rows={10}
              value={form.directorMessage || ''}
              onChange={(e) => update('directorMessage', e.target.value)}
            />
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

      <AdminCard className="flex flex-col sm:flex-row sm:items-center gap-3 sticky bottom-3 z-10 shadow-lg">
        <AdminButton type="submit" variant="primary" className="w-full sm:w-auto">
          Save settings
        </AdminButton>
        {saved && <span className="text-emerald-600 text-sm font-medium text-center sm:text-left">Settings saved successfully.</span>}
      </AdminCard>
    </form>
    </AdminPage>
  );
}
