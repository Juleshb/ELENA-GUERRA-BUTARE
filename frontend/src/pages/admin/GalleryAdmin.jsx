import { useMemo, useState } from 'react';
import { Eye, EyeOff, ImagePlus, LayoutGrid, List, Plus, Search, UploadCloud } from 'lucide-react';
import api from '../../api/client';
import { useCrud } from '../../hooks/useCrud';
import CrudTable, { AdminBadge } from '../../components/admin/CrudTable';
import FormModal, { Field, inputClass, CheckboxField } from '../../components/admin/FormModal';
import {
  AdminButton,
  AdminCard,
  AdminEmpty,
  AdminSection,
  AdminSelect,
  AdminStatCard,
  AdminToggleGroup,
  AdminToolbar,
} from '../../components/admin/AdminUI';
import { AttachedImagesEditor, SingleImageUpload } from '../../components/admin/ImageUploader';

const empty = { title: '', caption: '', imageUrl: '', category: '', order: 0, published: true };
const bulkDefaults = { category: '', published: true, startOrder: 0 };

export default function AdminGallery() {
  const { items, loading, create, update, remove, reload } = useCrud('/gallery');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [view, setView] = useState('table');
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkImages, setBulkImages] = useState([]);
  const [bulkConfig, setBulkConfig] = useState(bulkDefaults);
  const [savingBulk, setSavingBulk] = useState(false);

  const openCreate = () => {
    setForm({ ...empty, order: items.length });
    setEditingId(null);
    setModal(true);
  };

  const openEdit = (row) => {
    setForm({ ...empty, ...row });
    setEditingId(row.id);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.imageUrl) return;
    if (editingId) await update(editingId, form);
    else await create(form);
    setModal(false);
  };

  const openBulk = () => {
    setBulkImages([]);
    setBulkConfig({ ...bulkDefaults, startOrder: items.length });
    setBulkModal(true);
  };

  const handleBulkSave = async () => {
    if (!bulkImages.length) return;

    setSavingBulk(true);
    try {
      await api.post('/gallery/bulk', {
        images: bulkImages.map((img, index) => ({
          title: img.caption?.trim() || '',
          caption: img.caption?.trim() || '',
          imageUrl: img.url,
          category: bulkConfig.category,
          order: Number(bulkConfig.startOrder || 0) + index,
          published: bulkConfig.published,
        })),
      });
      await reload();
      setBulkModal(false);
    } finally {
      setSavingBulk(false);
    }
  };

  const categories = useMemo(
    () =>
      [...new Set(items.map((i) => (i.category || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const filtered = useMemo(() => {
    let list = [...items];
    if (categoryFilter) list = list.filter((i) => (i.category || '') === categoryFilter);
    if (statusFilter === 'published') list = list.filter((i) => i.published);
    if (statusFilter === 'draft') list = list.filter((i) => !i.published);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          (i.title || '').toLowerCase().includes(q) ||
          (i.caption || '').toLowerCase().includes(q) ||
          (i.category || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return Number(a.order || 0) - Number(b.order || 0);
    });
    return list;
  }, [items, categoryFilter, statusFilter, search, sortBy]);

  const stats = useMemo(
    () => ({
      total: items.length,
      published: items.filter((i) => i.published).length,
      drafts: items.filter((i) => !i.published).length,
      categories: categories.length,
    }),
    [items, categories.length]
  );

  const togglePublished = async (row) => {
    await update(row.id, { ...row, published: !row.published });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard label="Total images" value={stats.total} icon={ImagePlus} accent="blue" />
        <AdminStatCard label="Published" value={stats.published} icon={Eye} accent="green" />
        <AdminStatCard label="Drafts" value={stats.drafts} icon={EyeOff} accent="amber" />
        <AdminStatCard label="Categories" value={stats.categories} icon={LayoutGrid} accent="red" />
      </div>

      <AdminToolbar stats={`${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, caption, category..."
            className="w-72 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rw-blue-500/30"
          />
        </div>
        <AdminSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </AdminSelect>
        <AdminSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="order">Sort: Display order</option>
          <option value="newest">Sort: Newest first</option>
          <option value="title">Sort: Title A-Z</option>
        </AdminSelect>
        <AdminToggleGroup
          options={[
            { id: 'table', label: 'Table', icon: List },
            { id: 'cards', label: 'Cards', icon: LayoutGrid },
          ]}
          value={view}
          onChange={setView}
        />
        <AdminButton variant="secondary" icon={UploadCloud} onClick={openBulk}>
          Bulk upload
        </AdminButton>
        <AdminButton icon={Plus} onClick={openCreate}>
          Add image
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
          <AdminEmpty message="No gallery images match your filters." />
        </AdminCard>
      ) : view === 'table' ? (
        <AdminCard noPadding>
          <CrudTable
            columns={[
              {
                key: 'imageUrl',
                label: 'Preview',
                render: (r) =>
                  r.imageUrl ? (
                    <img src={r.imageUrl} alt={r.title || 'Gallery'} className="h-12 w-12 object-cover rounded-lg border border-slate-200" />
                  ) : null,
              },
              {
                key: 'title',
                label: 'Title',
                render: (r) => (
                  <div>
                    <p className="font-medium text-slate-800">{r.title || 'Untitled'}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{r.caption || 'No caption'}</p>
                  </div>
                ),
              },
              { key: 'category', label: 'Category' },
              { key: 'order', label: 'Order' },
              {
                key: 'published',
                label: 'Status',
                render: (r) => (
                  <button type="button" onClick={() => togglePublished(r)} className="inline-flex" title="Toggle publish">
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
              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                <img src={row.imageUrl} alt={row.title || 'Gallery'} className="w-full h-44 object-cover" />
                <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-semibold">
                  #{row.order || 0}
                </span>
                <button
                  type="button"
                  onClick={() => togglePublished(row)}
                  className="absolute top-2 right-2"
                  title="Toggle publish"
                >
                  <AdminBadge variant={row.published ? 'success' : 'draft'}>
                    {row.published ? 'Published' : 'Draft'}
                  </AdminBadge>
                </button>
              </div>
              <div>
                <p className="font-semibold text-rw-navy">{row.title || 'Untitled image'}</p>
                <p className="text-sm text-slate-600 line-clamp-2">{row.caption || 'No caption provided.'}</p>
                <p className="text-xs text-slate-500 mt-1">{row.category || 'No category'}</p>
              </div>
              <div className="flex items-center gap-2">
                <AdminButton variant="secondary" className="flex-1" onClick={() => openEdit(row)}>
                  Edit
                </AdminButton>
                <AdminButton variant="danger" onClick={() => remove(row.id)}>
                  Delete
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <FormModal title={editingId ? 'Edit Image' : 'Add Image'} open={modal} onClose={() => setModal(false)} onSubmit={handleSave}>
        <Field label="Image">
          <SingleImageUpload
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            label="Gallery"
          />
        </Field>
        <Field label="Title">
          <input className={inputClass} value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Caption">
          <input className={inputClass} value={form.caption || ''} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        </Field>
        <Field label="Category">
          <input className={inputClass} value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. campus, sports" />
        </Field>
        <Field label="Display order">
          <input
            type="number"
            className={inputClass}
            value={form.order ?? 0}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />
        </Field>
        <CheckboxField label="Published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
      </FormModal>

      <FormModal
        title="Bulk Upload Gallery Images"
        open={bulkModal}
        onClose={() => setBulkModal(false)}
        onSubmit={handleBulkSave}
        submitLabel={savingBulk ? 'Saving...' : `Save ${bulkImages.length || ''} Images`}
        wide
      >
        <AdminSection
          title="Upload multiple photos"
          description="Upload many images at once, then set shared metadata before publishing."
          className="!p-0 border-0 shadow-none"
        >
          <AttachedImagesEditor images={bulkImages} onChange={setBulkImages} />
        </AdminSection>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Shared category">
            <input
              className={inputClass}
              value={bulkConfig.category}
              onChange={(e) => setBulkConfig({ ...bulkConfig, category: e.target.value })}
              placeholder="e.g. campus, ceremonies"
            />
          </Field>
          <Field label="Starting display order">
            <input
              type="number"
              className={inputClass}
              value={bulkConfig.startOrder}
              onChange={(e) => setBulkConfig({ ...bulkConfig, startOrder: Number(e.target.value) })}
            />
          </Field>
        </div>
        <CheckboxField
          label="Publish uploaded images immediately"
          checked={bulkConfig.published}
          onChange={(e) => setBulkConfig({ ...bulkConfig, published: e.target.checked })}
        />
      </FormModal>
    </div>
  );
}
