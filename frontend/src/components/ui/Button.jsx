import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const variants = {
  primary:
    'bg-rw-blue-600 text-white hover:bg-rw-blue-700 shadow-md shadow-rw-blue-600/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
  secondary:
    'bg-white text-rw-blue-700 border-2 border-rw-blue-600 hover:bg-rw-blue-50 hover:scale-[1.02] active:scale-[0.98]',
  outline:
    'border-2 border-white/60 text-white hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]',
  green:
    'bg-rw-green-600 text-white hover:bg-rw-green-700 shadow-md shadow-rw-green-600/25 hover:scale-[1.02] active:scale-[0.98]',
  red:
    'bg-brand-red-600 text-white hover:bg-brand-red-700 shadow-md shadow-brand-red-600/30 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
};

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-rw-blue-500 focus:ring-offset-2 hover:-translate-y-0.5 active:translate-y-0';

  if (props.to) {
    const { to, ...rest } = props;
    return (
      <Link to={to} className={`${base} ${variants[variant]} ${className}`} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ReadMoreLink({ to, children = 'Read more' }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-rw-blue-600 font-semibold text-sm hover:text-rw-blue-700 group transition-colors duration-300"
    >
      {children}
      <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
    </Link>
  );
}
