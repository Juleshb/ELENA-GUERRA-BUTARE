import { Children, cloneElement, isValidElement } from 'react';
import { Link } from 'react-router-dom';

function withMobileWidth(className = '') {
  if (/\bw-full\b|\bw-auto\b|\bflex-1\b/.test(className)) return className;
  return `${className} w-full sm:w-auto`.trim();
}

/** Consistent page spacing for every admin screen */
export function AdminPage({ children, className = '' }) {
  return <div className={`space-y-3 sm:space-y-4 w-full min-w-0 ${className}`}>{children}</div>;
}

export function AdminCard({ children, className = '', padding = true, noPadding = false }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm min-w-0 ${
        padding && !noPadding ? 'p-4 sm:p-5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminToolbar({ stats, children }) {
  return (
    <div className="flex flex-col gap-3">
      {stats && (
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-rw-navy">{stats}</span>
        </p>
      )}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-end gap-2">
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return child;
          return cloneElement(child, {
            className: withMobileWidth(child.props.className || ''),
          });
        })}
      </div>
    </div>
  );
}

export function AdminButton({
  children,
  variant = 'primary',
  className = '',
  icon: Icon,
  ...props
}) {
  const variants = {
    primary: 'bg-rw-navy text-white hover:bg-rw-blue-800 shadow-sm',
    accent: 'bg-brand-red-600 text-white hover:bg-brand-red-700 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
    ghost: 'text-rw-blue-600 hover:bg-rw-blue-50',
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={1.75} className="shrink-0" />}
      {children}
    </button>
  );
}

export function AdminLinkButton({ children, to, variant = 'primary', className = '', icon: Icon }) {
  const variants = {
    primary: 'bg-rw-navy text-white hover:bg-rw-blue-800 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  };

  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} strokeWidth={1.75} className="shrink-0" />}
      {children}
    </Link>
  );
}

export function AdminSelect({ className = '', ...props }) {
  return (
    <select
      className={`border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rw-blue-500/30 focus:border-rw-blue-400 min-w-0 ${className}`}
      {...props}
    />
  );
}

export function AdminBadge({ variant = 'default', children }) {
  const styles = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    info: 'bg-rw-blue-50 text-rw-blue-700 ring-1 ring-rw-blue-600/20',
    draft: 'bg-slate-100 text-slate-500',
  };

  return (
    <span
      className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export function AdminSection({ title, description, action, children, className = '' }) {
  return (
    <AdminCard className={className}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 sm:mb-5 pb-4 border-b border-slate-100">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-rw-navy">{title}</h3>}
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          </div>
          {action && (
            <div className="shrink-0 flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">
              {action}
            </div>
          )}
        </div>
      )}
      <div className="min-w-0">{children}</div>
    </AdminCard>
  );
}

export function AdminEmpty({ message = 'No items yet.' }) {
  return (
    <div className="text-center py-10 sm:py-12 text-sm text-slate-500 px-4">{message}</div>
  );
}

export function AdminToggleGroup({ options, value, onChange, className = '' }) {
  return (
    <div className={`flex max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          aria-label={opt.label}
          className={`inline-flex flex-1 sm:flex-none shrink-0 items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
            value === opt.id
              ? 'bg-rw-navy text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {opt.icon && <opt.icon size={15} />}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

export function AdminStatCard({ label, value, icon: Icon, accent = 'blue' }) {
  const accents = {
    blue: 'bg-rw-blue-50 text-rw-blue-700',
    red: 'bg-brand-red-50 text-brand-red-600',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <AdminCard className="flex items-center gap-2.5 sm:gap-3 !p-3 sm:!p-4 min-w-0">
      {Icon && (
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${accents[accent]}`}>
          <Icon size={18} className="sm:hidden" strokeWidth={1.75} />
          <Icon size={20} className="hidden sm:block" strokeWidth={1.75} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-bold text-rw-navy tabular-nums leading-none truncate">{value}</p>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-1 truncate">{label}</p>
      </div>
    </AdminCard>
  );
}

export function AdminStatsGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 ${className}`}>
      {children}
    </div>
  );
}
