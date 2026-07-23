import { Newspaper } from 'lucide-react';
import { ReadMoreLink } from './Button';
import { IconBox } from './IconBox';
import { mediaUrl } from '../../lib/apiConfig';

export function FeatureCard({ icon: Icon, title, description, link, linkLabel = 'Read more' }) {
  if (!description) return null;

  return (
    <article className="bg-white rounded-xl border border-slate-200/80 overflow-hidden card-hover group h-full flex flex-col">
      <div className="h-1.5 bg-gradient-to-r from-rw-blue-600 via-brand-red-600 to-rw-blue-600" />
      <div className="p-6 md:p-7 flex flex-col flex-1">
        {Icon && <IconBox icon={Icon} className="mb-4" />}
        <h3 className="text-lg font-bold text-rw-navy mb-3 group-hover:text-rw-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed flex-1">{description}</p>
        {link && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <ReadMoreLink to={link}>{linkLabel}</ReadMoreLink>
          </div>
        )}
      </div>
    </article>
  );
}

export function NewsCard({ post }) {
  return (
    <article className="bg-white rounded-xl border border-slate-200/80 overflow-hidden card-hover flex flex-col h-full">
      {post.coverImage ? (
        <img src={mediaUrl(post.coverImage)} alt="" className="h-48 w-full object-cover img-zoom" />
      ) : (
        <div className="h-48 bg-gradient-to-br from-rw-blue-100 to-rw-green-50 flex items-center justify-center text-rw-blue-300">
          <Newspaper size={48} strokeWidth={1.5} aria-hidden />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <time className="text-xs font-medium text-rw-green-600 uppercase tracking-wide">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : new Date(post.createdAt).toLocaleDateString()}
        </time>
        <h3 className="font-bold text-rw-navy mt-2 mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-slate-600 text-sm flex-1 line-clamp-3">{post.excerpt}</p>
        <div className="mt-4">
          <ReadMoreLink to={`/news/${post.slug}`} />
        </div>
      </div>
    </article>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-xl border border-dashed border-slate-300">
      <p className="text-slate-500">{message}</p>
    </div>
  );
}
