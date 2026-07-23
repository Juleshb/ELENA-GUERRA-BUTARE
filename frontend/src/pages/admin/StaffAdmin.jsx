import { useMemo, useState } from 'react';
import { Building2, Eye, EyeOff, LayoutGrid, List, Plus, Users } from 'lucide-react';
import { useCrud } from '../../hooks/useCrud';
import CrudTable, { AdminBadge } from '../../components/admin/CrudTable';
import FormModal, { Field, inputClass, CheckboxField } from '../../components/admin/FormModal';
import { SingleImageUpload } from '../../components/admin/ImageUploader';
import { mediaUrl } from '../../lib/apiConfig';
import {
  AdminButton,
  AdminCard,
  AdminEmpty,
  AdminPage,
  AdminSelect,
  AdminStatCard,
  AdminStatsGrid,
  AdminToggleGroup,
  AdminToolbar,
} from '../../components/admin/AdminUI';

const empty = {
  name: '',
  role: '',
  department: '',
  email: '',
  phone: '',
  publishContactInfo: false,
  facebook: '',
  instagram: '',
  twitter: '',
  linkedin: '',
  bio: '',
  photoUrl: '',
  order: 0,
  published: true,
};

export default function AdminStaff() {
  const { items, loading, create, update, remove } = useCrud('/staff');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('table');

  const openCreate = () => {
    setForm(empty);
    setEditingId(null);
    setModal(true);
  };

  const openEdit = (row) => {
    setForm(row);
    setEditingId(row.id);
    setModal(true);
  };

  const handleSave = async () => {
    if (editingId) await update(editingId, form);
    else await create(form);
    setModal(false);
  };

  const togglePublished = async (row) => {
    await update(row.id, { ...row, published: !row.published });
  };

  const departmentOptions = useMemo(
    () =>
      [...new Set(items.map((i) => (i.department || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const filtered = useMemo(() => {
    let list = [...items];
    if (departmentFilter) list = list.filter((i) => (i.department || '') === departmentFilter);
    if (statusFilter === 'published') list = list.filter((i) => i.published);
    if (statusFilter === 'draft') list = list.filter((i) => !i.published);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.role?.toLowerCase().includes(q) ||
          (i.department || '').toLowerCase().includes(q) ||
          (i.email || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, departmentFilter, statusFilter, search]);

  const stats = useMemo(
    () => ({
      total: items.length,
      published: items.filter((i) => i.published).length,
      drafts: items.filter((i) => !i.published).length,
      departments: departmentOptions.length,
    }),
    [items, departmentOptions.length]
  );

  return (
    <AdminPage>
      <AdminStatsGrid>
        <AdminStatCard label="Total staff" value={stats.total} icon={Users} accent="blue" />
        <AdminStatCard label="Published" value={stats.published} icon={Eye} accent="green" />
        <AdminStatCard label="Drafts" value={stats.drafts} icon={EyeOff} accent="amber" />
        <AdminStatCard label="Departments" value={stats.departments} icon={Building2} accent="red" />
      </AdminStatsGrid>

      <AdminToolbar stats={`${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}>
        <div className="relative w-full sm:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, role, email..."
            className="w-full sm:w-60 border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rw-blue-500/30"
          />
        </div>
        <AdminSelect value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="w-full sm:w-auto">
          <option value="">All departments</option>
          {departmentOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-auto">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </AdminSelect>
        <AdminToggleGroup
          options={[
            { id: 'table', label: 'Table', icon: List },
            { id: 'cards', label: 'Cards', icon: LayoutGrid },
          ]}
          value={view}
          onChange={setView}
        />
        <AdminButton icon={Plus} onClick={openCreate} className="w-full sm:w-auto">
          Add staff
        </AdminButton>
      </AdminToolbar>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl border border-slate-200/80 bg-white" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <AdminCard>
          <AdminEmpty message="No staff profiles match your filters." />
        </AdminCard>
      ) : view === 'table' ? (
        <AdminCard noPadding>
          <CrudTable
            columns={[
              {
                key: 'name',
                label: 'Profile',
                render: (r) => (
                  <div className="flex items-center gap-3">
                    <img
                      src={mediaUrl(r.photoUrl) || '/logo.jpg'}
                      alt={r.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{r.name}</p>
                      <p className="text-xs text-slate-500 truncate">{r.email || 'No email'}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'role', label: 'Role' },
              { key: 'department', label: 'Department' },
              {
                key: 'publishContactInfo',
                label: 'Contact',
                render: (r) => (
                  <AdminBadge variant={r.publishContactInfo ? 'info' : 'draft'}>
                    {r.publishContactInfo ? 'Visible' : 'Hidden'}
                  </AdminBadge>
                ),
              },
              {
                key: 'social',
                label: 'Social',
                render: (r) => {
                  const count = [r.facebook, r.instagram, r.twitter, r.linkedin].filter(Boolean).length;
                  return (
                    <AdminBadge variant={count > 0 ? 'info' : 'draft'}>
                      {count > 0 ? `${count} profile${count !== 1 ? 's' : ''}` : 'None'}
                    </AdminBadge>
                  );
                },
              },
              {
                key: 'published',
                label: 'Status',
                render: (r) => (
                  <button
                    type="button"
                    onClick={() => togglePublished(r)}
                    className="inline-flex"
                    title="Toggle publish"
                  >
                    <AdminBadge variant={r.published ? 'success' : 'draft'}>
                      {r.published ? 'Published' : 'Draft'}
                    </AdminBadge>
                  </button>
                ),
              },
            ]}
            rows={filtered}
            onEdit={openEdit}
            onDelete={remove}
          />
        </AdminCard>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((row) => (
            <AdminCard key={row.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={mediaUrl(row.photoUrl) || '/logo.jpg'}
                  alt={row.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-rw-navy truncate">{row.name}</p>
                  <p className="text-sm text-slate-600 truncate">{row.role}</p>
                  <p className="text-xs text-slate-500 truncate">{row.department || 'No department'}</p>
                </div>
                <AdminBadge variant={row.published ? 'success' : 'draft'}>
                  {row.published ? 'Published' : 'Draft'}
                </AdminBadge>
              </div>
              <p className="text-sm text-slate-600 line-clamp-3">{row.bio || 'No biography yet.'}</p>
              <div className="flex items-center gap-2">
                <AdminButton variant="secondary" className="flex-1" onClick={() => openEdit(row)}>
                  Edit
                </AdminButton>
                <AdminButton variant={row.published ? 'ghost' : 'primary'} onClick={() => togglePublished(row)}>
                  {row.published ? 'Unpublish' : 'Publish'}
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <FormModal title={editingId ? 'Edit Staff' : 'Add Staff'} open={modal} onClose={() => setModal(false)} onSubmit={handleSave}>
        <Field label="Name">
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Role">
          <input className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
        </Field>
        <Field label="Department">
          <input className={inputClass} value={form.department || ''} onChange={(e) => setForm({ ...form, department: e.target.value })} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="staff@example.com"
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputClass}
              value={form.phone || ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+250 7XX XXX XXX"
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Facebook URL">
            <input
              className={inputClass}
              value={form.facebook || ''}
              onChange={(e) => setForm({ ...form, facebook: e.target.value })}
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="Instagram URL">
            <input
              className={inputClass}
              value={form.instagram || ''}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="https://instagram.com/..."
            />
          </Field>
          <Field label="X / Twitter URL">
            <input
              className={inputClass}
              value={form.twitter || ''}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              placeholder="https://x.com/..."
            />
          </Field>
          <Field label="LinkedIn URL">
            <input
              className={inputClass}
              value={form.linkedin || ''}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/..."
            />
          </Field>
        </div>
        <Field label="Profile Photo">
          <SingleImageUpload
            value={form.photoUrl || ''}
            onChange={(url) => setForm({ ...form, photoUrl: url })}
            label="Staff profile"
          />
        </Field>
        <Field label="Bio">
          <textarea className={inputClass} rows={3} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </Field>
        <CheckboxField
          label="Publish contact information (email and phone) on website"
          checked={Boolean(form.publishContactInfo)}
          onChange={(e) => setForm({ ...form, publishContactInfo: e.target.checked })}
        />
        <CheckboxField label="Published on website" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
      </FormModal>
    </AdminPage>
  );
}
