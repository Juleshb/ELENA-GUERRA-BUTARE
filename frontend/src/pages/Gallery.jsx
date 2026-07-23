import { useEffect, useMemo, useState } from 'react';
import { Camera, Images, ZoomIn } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/Card';
import { Reveal, RevealGroup } from '../components/ui/Reveal';
import Seo from '../components/Seo';
import PhotoLightbox from '../components/news/PhotoLightbox';
import { mediaUrl } from '../lib/apiConfig';

function toLightboxImages(images) {
  return images.map((img) => ({
    url: img.imageUrl,
    caption: img.title || img.caption || null,
  }));
}

function GalleryCard({ image, onOpen }) {
  const label = image.title || image.caption;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-full text-left rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-rw-blue-200/60 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rw-blue-500 focus-visible:ring-offset-2"
    >
      <div className="relative overflow-hidden">
        <img
          src={mediaUrl(image.imageUrl)}
          alt={label || 'Gallery photo'}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rw-navy/80 via-rw-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 text-rw-navy flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 shadow-md">
          <ZoomIn size={16} />
        </span>
        {image.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-rw-navy text-[10px] font-semibold uppercase tracking-wide shadow-sm">
            {image.category}
          </span>
        )}
        {label && (
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <p className="text-white font-semibold text-sm leading-snug line-clamp-2 drop-shadow-sm">{label}</p>
            {image.caption && image.title && (
              <p className="text-white/80 text-xs mt-1 line-clamp-2">{image.caption}</p>
            )}
          </div>
        )}
      </div>
      {label && (
        <div className="p-3.5 border-t border-slate-100 group-hover:hidden">
          <p className="text-sm font-medium text-rw-navy line-clamp-1">{label}</p>
        </div>
      )}
    </button>
  );
}

function CategorySection({ title, images, onOpen }) {
  return (
    <Reveal as="section">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 rounded-full bg-brand-red-600" />
        <div>
          <h2 className="text-lg font-bold text-rw-navy">{title}</h2>
          <p className="text-sm text-slate-500">
            {images.length} photo{images.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <RevealGroup className="columns-1 sm:columns-2 lg:columns-3 gap-4 lg:gap-5 space-y-4 lg:space-y-5">
        {images.map((img, index) => (
          <div key={img.id} className="break-inside-avoid">
            <GalleryCard image={img} onOpen={() => onOpen(images, index)} />
          </div>
        ))}
      </RevealGroup>
    </Reveal>
  );
}

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

  useEffect(() => {
    api
      .get('/gallery')
      .then((res) => setImages(res.data))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () =>
      [...new Set(images.map((i) => (i.category || '').trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [images]
  );

  const filtered = useMemo(() => {
    if (!activeCategory) return images;
    return images.filter((i) => (i.category || '') === activeCategory);
  }, [images, activeCategory]);

  const grouped = useMemo(() => {
    const groups = new Map();
    images.forEach((img) => {
      const cat = img.category?.trim() || 'General';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(img);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [images]);

  const openLightbox = (sourceImages, index) => {
    setLightbox({
      open: true,
      images: toLightboxImages(sourceImages),
      index: Math.min(index, sourceImages.length - 1),
    });
  };

  return (
    <>
      <Seo
        title="Photo Gallery"
        description="Campus life, ceremonies, and memorable moments from C.S Elena Guerra Butare photo gallery."
        path="/gallery"
      />
      <PageHeader
        title="Photo Gallery"
        subtitle="Campus life, ceremonies, and memorable moments at C.S Elena Guerra"
        breadcrumbs={[{ label: 'Gallery' }]}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        {!loading && images.length > 0 && (
          <Reveal className="flex flex-wrap items-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm">
              <Images size={16} className="text-rw-blue-600" />
              <span>
                <strong className="text-rw-navy">{images.length}</strong> photos
              </span>
            </div>
            {categories.length > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm">
                <Camera size={16} className="text-brand-red-600" />
                <span>
                  <strong className="text-rw-navy">{categories.length}</strong> categories
                </span>
              </div>
            )}
          </Reveal>
        )}

        {!loading && categories.length > 0 && (
          <Reveal delay={1} className="flex flex-wrap gap-2 mb-10">
            <button
              type="button"
              onClick={() => setActiveCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === ''
                  ? 'bg-rw-navy text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-rw-blue-300 hover:text-rw-navy'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-rw-navy text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-rw-blue-300 hover:text-rw-navy'
                }`}
              >
                {cat}
              </button>
            ))}
          </Reveal>
        )}

        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden border border-slate-200 animate-pulse">
                <div className={`bg-slate-200 ${i % 3 === 0 ? 'h-72' : i % 2 === 0 ? 'h-56' : 'h-64'}`} />
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <EmptyState message="Gallery images will appear here soon." />
        ) : activeCategory ? (
          <RevealGroup className="columns-1 sm:columns-2 lg:columns-3 gap-4 lg:gap-5 space-y-4 lg:space-y-5">
            {filtered.map((img, index) => (
              <div key={img.id} className="break-inside-avoid">
                <GalleryCard image={img} onOpen={() => openLightbox(filtered, index)} />
              </div>
            ))}
          </RevealGroup>
        ) : (
          <div className="space-y-12">
            {grouped.map(([category, sectionImages]) => (
              <CategorySection
                key={category}
                title={category}
                images={sectionImages}
                onOpen={openLightbox}
              />
            ))}
          </div>
        )}
      </div>

      <PhotoLightbox
        images={lightbox.images}
        index={lightbox.index}
        open={lightbox.open}
        onClose={() => setLightbox((s) => ({ ...s, open: false }))}
        onIndexChange={(next) =>
          setLightbox((s) => ({
            ...s,
            index: typeof next === 'function' ? next(s.index) : next,
          }))
        }
      />
    </>
  );
}
