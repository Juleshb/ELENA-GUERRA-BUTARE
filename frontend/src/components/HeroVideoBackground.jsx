import { DEFAULT_HERO_VIDEO } from '../lib/brand';

/** Extract YouTube video ID from youtu.be, youtube.com/watch, or embed URLs */
export function parseYoutubeId(url) {
  if (!url?.trim()) return null;
  const trimmed = url.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function isDirectVideoUrl(url) {
  if (!url?.trim()) return false;
  const lower = url.trim().toLowerCase();
  return (
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.includes('.mp4?') ||
    lower.startsWith('/')
  );
}

export function resolveHeroVideoSource(videoUrl) {
  const trimmed = videoUrl?.trim();
  if (!trimmed) {
    return { type: 'file', src: DEFAULT_HERO_VIDEO };
  }

  const youtubeId = parseYoutubeId(trimmed);
  if (youtubeId) {
    return { type: 'youtube', id: youtubeId };
  }

  if (isDirectVideoUrl(trimmed)) {
    return { type: 'file', src: trimmed };
  }

  // Fallback: try as direct URL anyway
  return { type: 'file', src: trimmed };
}

export default function HeroVideoBackground({ videoUrl }) {
  const source = resolveHeroVideoSource(videoUrl);

  if (source.type === 'youtube') {
    const embedUrl = new URL(`https://www.youtube.com/embed/${source.id}`);
    embedUrl.searchParams.set('autoplay', '1');
    embedUrl.searchParams.set('mute', '1');
    embedUrl.searchParams.set('loop', '1');
    embedUrl.searchParams.set('playlist', source.id);
    embedUrl.searchParams.set('controls', '0');
    embedUrl.searchParams.set('rel', '0');
    embedUrl.searchParams.set('modestbranding', '1');
    embedUrl.searchParams.set('playsinline', '1');
    embedUrl.searchParams.set('showinfo', '0');
    embedUrl.searchParams.set('iv_load_policy', '3');
    embedUrl.searchParams.set('disablekb', '1');

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <iframe
          title="Background video"
          src={embedUrl.toString()}
          className="absolute top-1/2 left-1/2 w-[300%] h-[300%] max-w-none -translate-x-1/2 -translate-y-1/2 hero-youtube-iframe"
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <video
      className="absolute inset-0 w-full h-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      poster="/logo.jpg"
      aria-hidden
    >
      <source src={source.src} type="video/mp4" />
    </video>
  );
}
