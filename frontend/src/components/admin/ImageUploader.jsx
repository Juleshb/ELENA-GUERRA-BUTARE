import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../../api/client';
import { inputClass } from './FormModal';

export function SingleImageUpload({ value, onChange, label = 'Image' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [urlError, setUrlError] = useState('');

  const upload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setUrlError('');
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (raw) => {
    if (raw.trim().startsWith('data:')) {
      setUrlError('Paste a link, or use Upload — do not paste image data directly.');
      return;
    }
    setUrlError('');
    onChange(raw);
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img src={value} alt={label} className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 text-xs font-semibold bg-white rounded-lg hover:bg-slate-100"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-36 rounded-xl border-2 border-dashed border-slate-300 hover:border-rw-blue-400 hover:bg-rw-blue-50/50 transition flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-rw-blue-600 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <ImagePlus size={28} strokeWidth={1.5} />
          )}
          <span className="text-sm font-medium">{uploading ? 'Uploading…' : 'Upload cover image'}</span>
        </button>
      )}
      <input
        className={inputClass}
        value={value?.startsWith('data:') ? '' : value || ''}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder="Or paste image URL (/uploads/...)"
      />
      {urlError && <p className="text-xs text-red-600">{urlError}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export function AttachedImagesEditor({ images, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const uploadMany = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));
    setUploading(true);
    try {
      const res = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const next = [
        ...images,
        ...res.data.urls.map((url, i) => ({
          url,
          caption: '',
          order: images.length + i,
        })),
      ];
      onChange(next);
    } finally {
      setUploading(false);
    }
  };

  const updateCaption = (index, caption) => {
    onChange(images.map((img, i) => (i === index ? { ...img, caption } : img)));
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));
  };

  const moveImage = (index, direction) => {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((img, i) => ({ ...img, order: i })));
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-rw-blue-400 hover:bg-rw-blue-50/50 text-sm font-medium text-slate-600 hover:text-rw-blue-700 transition disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <ImagePlus size={18} />
        )}
        {uploading ? 'Uploading photos…' : 'Add photos from event'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) uploadMany(e.target.files);
          e.target.value = '';
        }}
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
          {images.map((img, index) => (
            <div
              key={`${img.url}-${index}`}
              className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white"
            >
              <img src={img.url} alt="" className="w-full aspect-square object-cover" />
              <div className="p-2 space-y-2">
                <input
                  className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rw-blue-500"
                  value={img.caption || ''}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  placeholder="Caption"
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                  className="p-1.5 bg-white/90 rounded-lg shadow hover:bg-white disabled:opacity-30"
                  title="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1}
                  className="p-1.5 bg-white/90 rounded-lg shadow hover:bg-white disabled:opacity-30"
                  title="Move down"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1.5 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
