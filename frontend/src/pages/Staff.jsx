import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/Card';
import { Reveal, RevealGroup } from '../components/ui/Reveal';
import Seo from '../components/Seo';
import { Building2, Mail, Phone } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { mediaUrl } from '../lib/apiConfig';

const SOCIAL_LINKS = [
  { key: 'facebook', Icon: FaFacebookF, label: 'Facebook', hover: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]' },
  { key: 'instagram', Icon: FaInstagram, label: 'Instagram', hover: 'hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F]' },
  { key: 'twitter', Icon: FaXTwitter, label: 'X', hover: 'hover:bg-black hover:text-white hover:border-black' },
  { key: 'linkedin', Icon: FaLinkedinIn, label: 'LinkedIn', hover: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]' },
];

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function StaffCard({ member }) {
  const socials = SOCIAL_LINKS.filter((s) => member[s.key]);
  const showContact = member.publishContactInfo && (member.email || member.phone);

  return (
    <article className="group flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-rw-blue-200/60 hover:-translate-y-0.5">
      <div className="relative aspect-[4/5] max-h-64 bg-gradient-to-br from-rw-navy via-[#0d3d6b] to-rw-blue-800 overflow-hidden">
        {member.photoUrl ? (
          <img
            src={mediaUrl(member.photoUrl)}
            alt={member.name}
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold text-white/90">{initials(member.name)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-rw-navy/90 via-rw-navy/20 to-transparent" />
        {member.department && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-rw-navy text-[10px] font-semibold uppercase tracking-wide shadow-sm">
            <Building2 size={11} className="text-brand-red-600" />
            {member.department}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-12">
          <h2 className="font-bold text-white text-lg leading-tight drop-shadow-sm">{member.name}</h2>
          <p className="text-rw-blue-100 text-sm font-medium mt-0.5">{member.role}</p>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        {member.bio ? (
          <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 flex-1">{member.bio}</p>
        ) : (
          <p className="text-slate-400 text-sm italic flex-1">Faculty member at C.S Elena Guerra.</p>
        )}

        {(showContact || socials.length > 0) && (
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
            {showContact && (
              <div className="space-y-2">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-rw-navy transition min-w-0"
                  >
                    <span className="w-8 h-8 rounded-lg bg-rw-blue-50 text-rw-blue-700 flex items-center justify-center shrink-0">
                      <Mail size={14} />
                    </span>
                    <span className="truncate">{member.email}</span>
                  </a>
                )}
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-rw-navy transition"
                  >
                    <span className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                      <Phone size={14} />
                    </span>
                    {member.phone}
                  </a>
                )}
              </div>
            )}

            {socials.length > 0 && (
              <div className={`flex flex-wrap gap-2 ${showContact ? 'pt-1' : ''}`}>
                {socials.map(({ key, Icon, label, hover }) => (
                  <a
                    key={key}
                    href={member[key]}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${member.name} on ${label}`}
                    className={`w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center transition ${hover}`}
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/staff')
      .then((res) => setStaff(res.data))
      .finally(() => setLoading(false));
  }, []);

  const byDepartment = useMemo(() => {
    const groups = new Map();
    staff.forEach((member) => {
      const dept = member.department?.trim() || 'General';
      if (!groups.has(dept)) groups.set(dept, []);
      groups.get(dept).push(member);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [staff]);

  return (
    <>
      <Seo
        title="Our Team"
        description="Meet the educators and leaders at C.S Elena Guerra Butare — faculty and staff guiding learners in Huye, Rwanda."
        path="/staff"
      />
      <PageHeader
        title="Our Team"
        subtitle="Meet the educators and leaders guiding learners at C.S Elena Guerra"
        breadcrumbs={[{ label: 'Staff' }]}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="aspect-[4/5] max-h-64 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : staff.length === 0 ? (
          <EmptyState message="Staff profiles coming soon." />
        ) : (
          <div className="space-y-12">
            {byDepartment.map(([department, members]) => (
              <Reveal as="section" key={department}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 rounded-full bg-brand-red-600" />
                  <div>
                    <h2 className="text-lg font-bold text-rw-navy">{department}</h2>
                    <p className="text-sm text-slate-500">
                      {members.length} member{members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {members.map((member) => (
                    <StaffCard key={member.id} member={member} />
                  ))}
                </RevealGroup>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
