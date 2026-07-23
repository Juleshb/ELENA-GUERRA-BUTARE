import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Camera, ArrowRight, Newspaper, Images } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/Card';
import { Reveal, RevealGroup } from '../components/ui/Reveal';
import Seo from '../components/Seo';
import PhotoLightbox, { getPostImages } from '../components/news/PhotoLightbox';
import { mediaUrl } from '../lib/apiConfig';

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function PhotoStrip({ images, onPreview }) {
  const visible = images.slice(0, 4);
  const extra = images.length - visible.length;

  return (
    <div className="flex items-center gap-1.5 mt-3">
      {visible.map((img, i) => (
        <button
          key={`${img.url}-${i}`}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPreview(i);
          }}
          className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition shrink-0"
        >
          <img src={mediaUrl(img.url)} alt="" className="w-full h-full object-cover" />
        </button>
      ))}
      {extra > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPreview(4);
          }}
          className="w-10 h-10 rounded-lg bg-rw-navy/80 text-white text-xs font-bold flex items-center justify-center shrink-0 hover:bg-rw-navy transition"
        >
          +{extra}
        </button>
      )}
    </div>
  );
}

function FeaturedStory({ post, onPreview }) {
  const images = getPostImages(post);
  const date = post.publishedAt || post.createdAt;

  return (
    <article className="relative overflow-hidden rounded-2xl bg-rw-navy text-white shadow-xl">
      <div className="grid lg:grid-cols-2 min-h-[360px]">
        <div className="relative min-h-[240px] lg:min-h-full group">
          {post.coverImage || images[0]?.url ? (
            <>
              <img
                src={mediaUrl(post.coverImage || images[0]?.url)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rw-navy via-rw-navy/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-rw-navy/20 lg:to-rw-navy" />
              {images.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 lg:hidden">
                  <PhotoStrip images={images} onPreview={onPreview} />
                </div>
              )}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => onPreview(0)}
                  className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-xs font-semibold hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
                >
                  <Images size={14} />
                  {images.length} photos
                </button>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-rw-blue-800 to-rw-navy flex items-center justify-center">
              <Newspaper size={64} className="text-white/20" strokeWidth={1} />
            </div>
          )}
        </div>

        <div className="relative p-8 md:p-10 flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-rw-gold-400 mb-3">
            <span className="w-8 h-0.5 bg-brand-red-600 rounded" />
            Latest story
          </span>
          <time className="inline-flex items-center gap-1.5 text-sm text-blue-200 mb-3">
            <Calendar size={14} />
            {formatDate(date)}
          </time>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4">{post.title}</h2>
          {post.excerpt && (
            <p className="text-blue-100 leading-relaxed line-clamp-3 mb-6">{post.excerpt}</p>
          )}
          {images.length > 0 && (
            <div className="hidden lg:block mb-6">
              <PhotoStrip images={images} onPreview={onPreview} />
            </div>
          )}
          <Link
            to={`/news/${post.slug}`}
            className="inline-flex items-center gap-2 self-start px-5 py-2.5 bg-brand-red-600 hover:bg-brand-red-700 rounded-xl text-sm font-semibold transition"
          >
            Read full story
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function StoryCard({ post, onPreview }) {
  const images = getPostImages(post);
  const thumb = post.coverImage || images[0]?.url;
  const date = post.publishedAt || post.createdAt;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden card-hover flex flex-col h-full">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {thumb ? (
          <>
            <img
              src={mediaUrl(thumb)}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rw-blue-50 to-brand-red-50">
            <Newspaper size={36} className="text-rw-blue-300" strokeWidth={1.5} />
          </div>
        )}

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onPreview(post, 0)}
            className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wide hover:bg-black/75 transition"
          >
            <Camera size={11} />
            {images.length}
          </button>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0 duration-200">
            {images.slice(0, 3).map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPreview(post, i);
                }}
                className="flex-1 h-12 rounded-lg overflow-hidden border-2 border-white/80 shadow-lg hover:scale-105 transition"
              >
                <img src={mediaUrl(img.url)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 md:p-6 flex flex-col flex-1">
        <time className="text-xs font-semibold text-rw-green-600 flex items-center gap-1">
          <Calendar size={12} />
          {formatShortDate(date)}
        </time>
        <h2 className="text-lg font-bold text-rw-navy mt-2 mb-2 line-clamp-2 leading-snug">
          <Link to={`/news/${post.slug}`} className="hover:text-rw-blue-600 transition">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed flex-1">{post.excerpt}</p>
        )}
        <Link
          to={`/news/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-rw-blue-600 hover:text-rw-blue-700 transition"
        >
          Read story
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}

export default function News() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

  useEffect(() => {
    api
      .get('/posts')
      .then((res) => setPosts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...rest] = posts;
  const totalPhotos = useMemo(
    () => posts.reduce((sum, p) => sum + getPostImages(p).length, 0),
    [posts]
  );

  const openPreview = (postOrImages, index = 0) => {
    const images = Array.isArray(postOrImages) ? postOrImages : getPostImages(postOrImages);
    if (!images.length) return;
    setLightbox({ open: true, images, index: Math.min(index, images.length - 1) });
  };

  return (
    <>
      <Seo
        title="News & Stories"
        description="School news, announcements, and photo stories from C.S Elena Guerra Butare — Catholic school community in Huye, Rwanda."
        path="/news"
      />
      <PageHeader
        title="News & Stories"
        subtitle="School events, announcements, and photo stories from our community"
        breadcrumbs={[{ label: 'News' }]}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-12">
        {!loading && posts.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600">
              <Newspaper size={16} className="text-rw-blue-600" />
              <span>
                <strong className="text-rw-navy">{posts.length}</strong> stories
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600">
              <Camera size={16} className="text-brand-red-600" />
              <span>
                <strong className="text-rw-navy">{totalPhotos}</strong> photos
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-slate-200">
                  <div className="aspect-[16/10] bg-slate-200 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-slate-200 rounded w-1/3 animate-pulse" />
                    <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState message="No news published yet. Check back soon for school updates." />
        ) : (
          <>
            {featured && (
              <Reveal>
                <FeaturedStory
                  post={featured}
                  onPreview={(index) => openPreview(featured, index)}
                />
              </Reveal>
            )}

            {rest.length > 0 && (
              <Reveal as="section" delay={1}>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-bold text-rw-navy">More stories</h2>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post) => (
                    <StoryCard
                      key={post.id}
                      post={post}
                      onPreview={openPreview}
                    />
                  ))}
                </RevealGroup>
              </Reveal>
            )}
          </>
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
