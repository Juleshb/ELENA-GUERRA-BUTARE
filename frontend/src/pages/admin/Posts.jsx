import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper,
  Plus,
  Search,
  Image as ImageIcon,
  Calendar,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  X,
  FileText,
  Camera,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useCrud } from '../../hooks/useCrud';
import { mediaUrl } from '../../lib/apiConfig';
import { Field, inputClass } from '../../components/admin/FormModal';
import { AttachedImagesEditor, SingleImageUpload } from '../../components/admin/ImageUploader';
import { htmlToStory } from '../../lib/story';
import { AdminButton, AdminCard, AdminStatCard, AdminToolbar } from '../../components/admin/AdminUI';

const empty = {
  title: '',
  slug: '',
  excerpt: '',
  story: '',
  coverImage: '',
  images: [],
  published: false,
};

const FILTERS = [
  { id: 'all', label: 'All stories' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Drafts' },
];

function relativeDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatPill({ label, value, accent }) {
  const accents = { blue: 'blue', green: 'green', amber: 'amber', slate: 'blue' };
  return <AdminStatCard label={label} value={value} accent={accents[accent] || 'blue'} />;
}

function StoryCard({ post, onEdit, onDelete, onTogglePublish }) {
  const thumb = post.coverImage || post.images?.[0]?.url;
  const photoCount = post.images?.length || 0;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-rw-blue-200 hover:shadow-lg transition-all duration-200">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200">
        {thumb ? (
          <img src={mediaUrl(thumb)} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <Newspaper size={32} strokeWidth={1.5} />
            <span className="text-xs mt-2 font-medium">No cover image</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm ${
              post.published
                ? 'bg-green-500 text-white'
                : 'bg-white/90 text-slate-600 backdrop-blur'
            }`}
          >
            {post.published ? (
              <>
                <Eye size={10} /> Live
              </>
            ) : (
              <>
                <EyeOff size={10} /> Draft
              </>
            )}
          </span>
        </div>
        {photoCount > 0 && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-black/50 text-white backdrop-blur">
            <Camera size={10} />
            {photoCount}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <button
            onClick={() => onEdit(post)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white rounded-lg text-xs font-semibold text-rw-navy hover:bg-rw-blue-50 transition"
          >
            <Pencil size={13} />
            Edit
          </button>
          {post.published && (
            <Link
              to={`/news/${post.slug}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-white/90 rounded-lg text-xs font-semibold text-rw-blue-700 hover:bg-white transition"
            >
              <ExternalLink size={13} />
            </Link>
          )}
          <button
            onClick={() => onTogglePublish(post)}
            className="inline-flex items-center justify-center px-3 py-2 bg-white/90 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white transition"
            title={post.published ? 'Unpublish' : 'Publish'}
          >
            {post.published ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="inline-flex items-center justify-center px-3 py-2 bg-red-600 rounded-lg text-xs font-semibold text-white hover:bg-red-700 transition"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-rw-navy line-clamp-2 leading-snug">{post.title}</h3>
        {post.excerpt && (
          <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-3 mt-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} />
            {relativeDate(post.publishedAt || post.createdAt)}
          </span>
          {photoCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <ImageIcon size={12} />
              {photoCount} photo{photoCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function EditorPanel({ open, editingId, form, setForm, onClose, onSave, saving, saveError }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close editor"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full">
        <div className="shrink-0 px-6 py-4 border-b border-slate-100 bg-rw-navy text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider">
                {editingId ? 'Editing story' : 'New story'}
              </p>
              <h2 className="text-lg font-bold mt-1">
                {form.title || 'Untitled news story'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="flex-1 overflow-y-auto"
        >
          <div className="p-6 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rw-blue-100 text-rw-blue-700 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-rw-navy">Story details</h3>
                  <p className="text-xs text-slate-500">Title, summary, and URL slug</p>
                </div>
              </div>
              <div className="space-y-4 pl-0 sm:pl-10">
                <Field label="Title">
                  <input
                    className={inputClass}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Sports Day 2026 Highlights"
                    required
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="URL slug">
                    <input
                      className={inputClass}
                      value={form.slug || ''}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="auto-generated"
                    />
                  </Field>
                  <Field label="Short summary">
                    <input
                      className={inputClass}
                      value={form.excerpt || ''}
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                      placeholder="Shown on news listing"
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-red-50 text-brand-red-600 flex items-center justify-center">
                  <Newspaper size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-rw-navy">Full story</h3>
                  <p className="text-xs text-slate-500">Write the article — blank lines become paragraphs</p>
                </div>
              </div>
              <div className="pl-0 sm:pl-10">
                <textarea
                  className={`${inputClass} min-h-[220px] leading-relaxed`}
                  value={form.story}
                  onChange={(e) => setForm({ ...form, story: e.target.value })}
                  placeholder="Tell the story of what happened at school…"
                  required
                />
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
                  <Camera size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-rw-navy">Photos</h3>
                  <p className="text-xs text-slate-500">Cover image and event gallery</p>
                </div>
              </div>
              <div className="space-y-6 pl-0 sm:pl-10">
                <Field label="Cover image">
                  <SingleImageUpload
                    value={form.coverImage}
                    onChange={(url) => setForm({ ...form, coverImage: url })}
                    label="Cover"
                  />
                </Field>
                <Field label="Gallery photos">
                  <AttachedImagesEditor
                    images={form.images}
                    onChange={(images) => setForm({ ...form, images })}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      form.published ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {form.published ? <CheckCircle2 size={20} /> : <EyeOff size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-rw-navy text-sm">Publish on website</p>
                    <p className="text-xs text-slate-500">
                      {form.published
                        ? 'Visible to everyone on the news page'
                        : 'Saved as draft — only visible in admin'}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 rounded-full peer-checked:bg-green-500 transition" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition" />
                </div>
              </label>
            </section>
          </div>
        </form>

        <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
          {saveError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {saveError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rw-navy text-white rounded-xl text-sm font-medium hover:bg-rw-blue-800 disabled:opacity-60 transition"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {editingId ? 'Save changes' : 'Save story'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPosts() {
  const { items, loading, create, update, remove } = useCrud('/posts');
  const [panelOpen, setPanelOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    const published = items.filter((p) => p.published).length;
    const drafts = items.length - published;
    const photos = items.reduce((sum, p) => sum + (p.images?.length || 0), 0);
    return { total: items.length, published, drafts, photos };
  }, [items]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (filter === 'published') list = list.filter((p) => p.published);
    if (filter === 'draft') list = list.filter((p) => !p.published);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q)
      );
    }
    return list.sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
    );
  }, [items, filter, search]);

  const openCreate = () => {
    setForm(empty);
    setEditingId(null);
    setSaveError('');
    setPanelOpen(true);
  };

  const openEdit = (row) => {
    setForm({
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt || '',
      story: htmlToStory(row.content),
      coverImage: row.coverImage || '',
      images: (row.images || []).map((img) => ({
        url: img.url,
        caption: img.caption || '',
        order: img.order,
      })),
      published: row.published,
    });
    setEditingId(row.id);
    setSaveError('');
    setPanelOpen(true);
  };

  const buildPayload = (data) => {
    const images = data.images
      .filter((img) => img.url && !img.url.startsWith('data:'))
      .map((img, index) => ({
        url: img.url,
        caption: img.caption,
        order: index,
      }));
    const coverImage =
      data.coverImage && !data.coverImage.startsWith('data:')
        ? data.coverImage
        : images[0]?.url || '';

    return {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.story,
      coverImage,
      images,
      published: data.published,
    };
  };

  const handleSave = async () => {
    if (form.images.some((img) => img.url?.startsWith('data:')) || form.coverImage?.startsWith('data:')) {
      setSaveError('Upload images using the Upload button — pasted image data cannot be saved.');
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const payload = buildPayload(form);
      if (editingId) await update(editingId, payload);
      else await create(payload);
      setPanelOpen(false);
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save story. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (post) => {
    await update(post.id, buildPayload({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      story: post.content,
      coverImage: post.coverImage || '',
      images: post.images || [],
      published: !post.published,
    }));
  };

  return (
    <div className="space-y-4">
      <AdminToolbar stats={`${stats.total} stories · ${stats.drafts} drafts`}>
        <AdminButton variant="accent" icon={Plus} onClick={openCreate}>
          New story
        </AdminButton>
      </AdminToolbar>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatPill label="Total stories" value={stats.total} accent="blue" />
        <StatPill label="Published" value={stats.published} accent="green" />
        <StatPill label="Drafts" value={stats.drafts} accent="amber" />
        <StatPill label="Gallery photos" value={stats.photos} accent="slate" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f.id
                  ? 'bg-rw-navy text-white shadow-sm'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:border-rw-blue-200 hover:text-rw-navy'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories…"
            className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rw-blue-500 focus:border-rw-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="aspect-[16/10] bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rw-blue-50 text-rw-blue-600 flex items-center justify-center mx-auto">
            <Newspaper size={32} strokeWidth={1.5} />
          </div>
          <h3 className="font-bold text-rw-navy mt-4">
            {search || filter !== 'all' ? 'No stories match your filters' : 'No stories yet'}
          </h3>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
            {search || filter !== 'all'
              ? 'Try a different search or filter.'
              : 'Create your first news story with photos from school events.'}
          </p>
          {!search && filter === 'all' && (
            <AdminButton icon={Plus} onClick={openCreate} className="mt-6">
              Write your first story
            </AdminButton>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((post) => (
            <StoryCard
              key={post.id}
              post={post}
              onEdit={openEdit}
              onDelete={remove}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}

      <EditorPanel
        open={panelOpen}
        editingId={editingId}
        form={form}
        setForm={setForm}
        onClose={() => setPanelOpen(false)}
        onSave={handleSave}
        saving={saving}
        saveError={saveError}
      />
    </div>
  );
}
