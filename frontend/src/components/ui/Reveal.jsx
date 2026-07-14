import { useEffect, useRef, useState } from 'react';

const VARIANTS = {
  up: 'reveal-up',
  down: 'reveal-down',
  left: 'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
  fade: 'reveal-fade',
};

function useRevealOnScroll(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -48px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function Reveal({
  children,
  className = '',
  variant = 'up',
  delay = 0,
  as: Tag = 'div',
  threshold,
  ...props
}) {
  const { ref, visible } = useRevealOnScroll(threshold);
  const delayClass = delay > 0 ? `reveal-delay-${Math.min(delay, 10)}` : '';

  return (
    <Tag
      ref={ref}
      className={`reveal ${VARIANTS[variant] || VARIANTS.up} ${visible ? 'reveal-visible' : ''} ${delayClass} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function RevealGroup({ children, className = '', as: Tag = 'div', threshold, ...props }) {
  const { ref, visible } = useRevealOnScroll(threshold);

  return (
    <Tag ref={ref} className={`reveal-stagger ${visible ? 'reveal-visible' : ''} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
