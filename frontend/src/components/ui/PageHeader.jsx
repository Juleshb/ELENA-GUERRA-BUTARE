import { Link } from 'react-router-dom';

export default function PageHeader({ title, subtitle, breadcrumbs = [] }) {
  return (
    <div className="bg-rw-navy text-white relative overflow-hidden page-header-enter">
      <div className="absolute inset-0 opacity-10">
        <div className="page-header-blob absolute top-0 right-0 w-96 h-96 bg-rw-blue-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="page-header-blob page-header-blob-delay absolute bottom-0 left-0 w-64 h-64 bg-brand-red-600/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>
      <div className="rw-tricolor absolute bottom-0 left-0 right-0" />
      <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-14">
        {breadcrumbs.length > 0 && (
          <nav className="page-header-breadcrumb flex flex-wrap items-center gap-2 text-sm text-blue-200 mb-4">
            <Link to="/" className="hover:text-white transition-colors duration-300">
              Home
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-blue-400">/</span>
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-white transition-colors duration-300">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="page-header-title text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="page-header-subtitle mt-3 text-blue-100 max-w-2xl text-lg">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
