import { Link, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';

export default function GetInTouchFab() {
  const { isAuthenticated } = usePortalAuth();
  const location = useLocation();
  const to = isAuthenticated ? '/my-messages' : '/contact';

  if (location.pathname === to) return null;

  return (
    <Link
      to={to}
      className="fab-enter fixed bottom-5 right-5 z-[100] inline-flex items-center gap-2.5 pl-4 pr-5 py-3.5 rounded-full bg-brand-red-600 text-white font-semibold text-sm shadow-lg shadow-brand-red-600/30 hover:bg-brand-red-700 hover:shadow-xl hover:shadow-brand-red-600/35 transition-all duration-300 ease-out hover:scale-[1.04] active:scale-[0.97]"
      aria-label="Get in touch with us"
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 shrink-0">
        <MessageCircle size={22} strokeWidth={2.25} aria-hidden />
      </span>
      <span className="whitespace-nowrap text-xs sm:text-sm pr-0.5">Get in touch with us</span>
    </Link>
  );
}
