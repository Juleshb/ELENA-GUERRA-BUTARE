import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Calendar,
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import api from '../api/client';
import PhotoLightbox, { getPostImages, PhotoPreviewButton } from '../components/news/PhotoLightbox';

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function GalleryTile({ img, index, onClick, featured = false }) {
  return (
    <button
      type="button"
      onClick={() => onClick(index)}
      className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-left focus:outline-none focus:ring-2 focus:ring-rw-blue-500 ${
        featured ? 'sm:col-span-2 sm:row-span-2' : ''
      }`}
    >
      <img
        src={img.url}
        alt={img.caption || `Photo ${index + 1}`}
        className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
          featured ? 'aspect-[16/10] sm:aspect-auto sm:h-full min-h-[200px]' : 'aspect-[4/3]'
        }`}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-rw-navy text-xs font-semibold shadow-lg">
          <Maximize2 size={14} />
          View
        </span>
      </div>
      {img.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-white text-xs line-clamp-2">{img.caption}</p>
        </div>
      )}
    </button>
  );
}

export default function NewsDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  useEffect(() => {
    api.get(`/posts/slug/${slug}`).then((res) => setPost(res.data));
  }, [slug]);

  const allImages = useMemo(() => (post ? getPostImages(post) : []), [post]);

  const openLightbox = (index) => {
    setLightbox({ open: true, index });
  };

  if (!post) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-rw-blue-200 border-t-rw-blue-600 animate-spin mx-auto" />
          <p className="text-slate-500 text-sm">Loading story…</p>
        </div>
      </div>
    );
  }

  const date = post.publishedAt || post.createdAt;
  const heroImage = post.coverImage || allImages[0]?.url;

  return (
    <>
      {/* Hero */}
      <div className="relative bg-rw-navy text-white overflow-hidden">
        <div className="absolute inset-0">
          {heroImage ? (
            <>
              <img src={heroImage} alt="" className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-rw-navy via-rw-navy/80 to-rw-navy/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-rw-blue-900 to-rw-navy" />
          )}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-8 pb-12 md:pt-12 md:pb-16">
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition mb-6"
          >
            <ArrowLeft size={16} />
            Back to news
          </Link>

          <time className="inline-flex items-center gap-1.5 text-sm text-rw-gold-400 font-medium">
            <Calendar size={14} />
            {formatDate(date)}
          </time>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mt-3 mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-blue-100 max-w-2xl leading-relaxed">{post.excerpt}</p>
          )}

          {allImages.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openLightbox(0)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition"
              >
                <Camera size={16} />
                View all {allImages.length} photo{allImages.length !== 1 ? 's' : ''}
              </button>
              {heroImage && (
                <button
                  type="button"
                  onClick={() => openLightbox(0)}
                  className="relative w-20 h-14 rounded-lg overflow-hidden border-2 border-white/30 hover:border-white transition"
                >
                  <img src={heroImage} alt="" className="w-full h-full object-cover" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="rw-tricolor" />
      </div>

      <article className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        {/* Cover preview */}
        {heroImage && (
          <div className="relative -mt-16 md:-mt-20 mb-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white group">
            <img
              src={heroImage}
              alt=""
              className="w-full max-h-[480px] object-cover cursor-pointer"
              onClick={() => openLightbox(0)}
            />
            <div className="absolute top-4 right-4">
              <PhotoPreviewButton onClick={() => openLightbox(0)} />
            </div>
          </div>
        )}

        {/* Story body */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-10">
          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Photo gallery */}
        {allImages.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-rw-navy flex items-center gap-2">
                  <Camera size={20} className="text-brand-red-600" />
                  Photo gallery
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Click any photo to open fullscreen preview
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openLightbox((lightbox.index - 1 + allImages.length) % allImages.length)
                  }
                  disabled={allImages.length <= 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs text-slate-500 tabular-nums min-w-[3rem] text-center">
                  {lightbox.index + 1}/{allImages.length}
                </span>
                <button
                  type="button"
                  onClick={() => openLightbox((lightbox.index + 1) % allImages.length)}
                  disabled={allImages.length <= 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition"
                  aria-label="Next photo"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* All images grid including hero for browsing */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {allImages.map((img, index) => (
                <GalleryTile
                  key={`${img.url}-${index}`}
                  img={img}
                  index={index}
                  onClick={openLightbox}
                  featured={index === 0 && allImages.length >= 3}
                />
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-slate-500">
            Published {formatDate(date)}
            {allImages.length > 0 && ` · ${allImages.length} photos`}
          </p>
          <Link
            to="/news"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rw-blue-600 text-white text-sm font-semibold hover:bg-rw-blue-700 transition self-start"
          >
            <ArrowLeft size={16} />
            More stories
          </Link>
        </div>
      </article>

      <PhotoLightbox
        images={allImages}
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
