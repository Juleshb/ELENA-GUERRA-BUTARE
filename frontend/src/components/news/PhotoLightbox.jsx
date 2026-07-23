import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { mediaUrl } from '../../lib/apiConfig';

export function getPostImages(post) {
  if (!post) return [];
  const seen = new Set();
  const images = [];

  const add = (url, caption = null) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    images.push({ url, caption });
  };

  add(post.coverImage);
  (post.images || []).forEach((img) => add(img.url, img.caption));

  return images;
}

export default function PhotoLightbox({ images, index, open, onClose, onIndexChange }) {
  const total = images.length;
  const current = images[index];

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    onIndexChange((index - 1 + total) % total);
  }, [index, total, onIndexChange]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    onIndexChange((index + 1) % total);
  }, [index, total, onIndexChange]);

  useEffect(() => {
    if (!open) return undefined;

    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, goPrev, goNext]);

  if (!open || !current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Photo preview"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close preview"
      />

      <div className="relative z-10 flex flex-col h-full pointer-events-none">
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 text-white pointer-events-auto">
        <p className="text-sm font-medium text-white/80">
          {index + 1} / {total}
        </p>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-white/50">Esc to close</span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-rw-navy font-semibold text-sm hover:bg-slate-100 transition shadow-lg"
            aria-label="Close preview"
          >
            <X size={18} />
            Close
          </button>
        </div>
      </div>

      <div
        className="flex-1 relative flex items-center justify-center px-4 md:px-16 min-h-0 pointer-events-auto"
        onClick={onClose}
      >
        {total > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-2 md:left-4 z-10 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Previous photo"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <img
          src={mediaUrl(current.url)}
          alt={current.caption || `Photo ${index + 1}`}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
          draggable={false}
          onClick={(e) => e.stopPropagation()}
        />

        {total > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-2 md:right-4 z-10 p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Next photo"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {current.caption && (
        <p className="shrink-0 text-center text-white/90 text-sm md:text-base px-6 py-3 max-w-3xl mx-auto pointer-events-auto">
          {current.caption}
        </p>
      )}

      {total > 1 && (
        <div className="shrink-0 px-4 pb-4 pt-2 overflow-x-auto pointer-events-auto">
          <div className="flex justify-center gap-2 min-w-min mx-auto">
            {images.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={() => onIndexChange(i)}
                className={`shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition ${
                  i === index
                    ? 'border-white ring-2 ring-white/30 scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={mediaUrl(img.url)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>,
    document.body
  );
}

export function PhotoPreviewButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-xs font-semibold hover:bg-black/70 transition ${className}`}
    >
      <ZoomIn size={14} />
      Preview
    </button>
  );
}
