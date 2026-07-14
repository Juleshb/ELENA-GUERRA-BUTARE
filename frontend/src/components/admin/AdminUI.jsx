import { Link } from 'react-router-dom';

export function AdminCard({ children, className = '', padding = true, noPadding = false }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm ${
        padding && !noPadding ? 'p-5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminToolbar({ stats, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {stats && (
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-rw-navy">{stats}</span>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{children}</div>
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
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={1.75} />}
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
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} strokeWidth={1.75} />}
      {children}
    </Link>
  );
}

export function AdminSelect({ className = '', ...props }) {
  return (
    <select
      className={`border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rw-blue-500/30 focus:border-rw-blue-400 ${className}`}
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
        <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-sm font-semibold text-rw-navy">{title}</h3>}
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </AdminCard>
  );
}

export function AdminEmpty({ message = 'No items yet.' }) {
  return (
    <div className="text-center py-12 text-sm text-slate-500">{message}</div>
  );
}

export function AdminToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
            value === opt.id
              ? 'bg-rw-navy text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {opt.icon && <opt.icon size={15} />}
          {opt.label}
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
    <AdminCard className="flex items-center gap-3 !p-4">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accents[accent]}`}>
          <Icon size={20} strokeWidth={1.75} />
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-rw-navy tabular-nums leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </AdminCard>
  );
}
