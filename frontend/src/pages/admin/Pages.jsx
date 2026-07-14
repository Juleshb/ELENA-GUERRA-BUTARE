import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCrud } from '../../hooks/useCrud';
import CrudTable, { AdminBadge } from '../../components/admin/CrudTable';
import FormModal, { Field, inputClass, CheckboxField } from '../../components/admin/FormModal';
import { AdminButton, AdminCard, AdminToolbar } from '../../components/admin/AdminUI';

const empty = { title: '', slug: '', excerpt: '', content: '', published: false, showInNav: true, navOrder: 0 };

export default function AdminPages() {
  const { items, create, update, remove } = useCrud('/pages');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

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

  return (
    <div className="space-y-4">
      <AdminToolbar stats={`${items.length} page${items.length !== 1 ? 's' : ''}`}>
        <AdminButton icon={Plus} onClick={openCreate}>
          New page
        </AdminButton>
      </AdminToolbar>

      <AdminCard noPadding>
        <CrudTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'slug', label: 'Slug' },
            {
              key: 'published',
              label: 'Status',
              render: (r) => (
                <AdminBadge variant={r.published ? 'success' : 'draft'}>
                  {r.published ? 'Published' : 'Draft'}
                </AdminBadge>
              ),
            },
          ]}
          rows={items}
          onEdit={openEdit}
          onDelete={remove}
        />
      </AdminCard>

      <FormModal title={editingId ? 'Edit Page' : 'New Page'} open={modal} onClose={() => setModal(false)} onSubmit={handleSave}>
        <Field label="Title">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </Field>
        <Field label="Slug">
          <input className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if empty" />
        </Field>
        <Field label="Excerpt">
          <input className={inputClass} value={form.excerpt || ''} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </Field>
        <Field label="Content (HTML)">
          <textarea className={inputClass} rows={6} value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </Field>
        <CheckboxField label="Published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
        <CheckboxField label="Show in navigation" checked={form.showInNav} onChange={(e) => setForm({ ...form, showInNav: e.target.checked })} />
      </FormModal>
    </div>
  );
}
