/** Icon container matching RTB card style */
export function IconBox({ icon: Icon, className = '', size = 22 }) {
  if (!Icon) return null;
  return (
    <div
      className={`w-12 h-12 rounded-lg bg-rw-blue-50 text-rw-blue-600 flex items-center justify-center shrink-0 ${className}`}
    >
      <Icon size={size} strokeWidth={2} aria-hidden />
    </div>
  );
}

export function InlineIcon({ icon: Icon, className = 'text-rw-blue-600', size = 18 }) {
  if (!Icon) return null;
  return <Icon className={`inline shrink-0 ${className}`} size={size} strokeWidth={2} aria-hidden />;
}
