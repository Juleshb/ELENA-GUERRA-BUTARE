import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Search,
  Trash2,
  XCircle,
  Hourglass,
  Users,
} from 'lucide-react';
import { Field, inputClass } from '../../components/admin/FormModal';
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminEmpty,
  AdminSelect,
  AdminStatCard,
} from '../../components/admin/AdminUI';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WAITLISTED', label: 'Waitlisted' },
];

const STATUS_COLORS = {
  PENDING: 'warning',
  UNDER_REVIEW: 'info',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  WAITLISTED: 'default',
};

const LEVEL_LABELS = {
  PRIMARY: 'Primary',
  ORDINARY_LEVEL: 'O-Level',
  ADVANCED_LEVEL: 'A-Level',
};

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'UNDER_REVIEW', label: 'In review' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'WAITLISTED', label: 'Waitlisted' },
];

const DETAIL_TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'student', label: 'Student' },
  { id: 'family', label: 'Family' },
  { id: 'documents', label: 'Documents' },
  { id: 'history', label: 'History' },
];

function initials(first, last) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
}

function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function guardianLabel(app) {
  if (app.guardianType === 'FATHER') return 'Father';
  if (app.guardianType === 'MOTHER') return 'Mother';
  if (app.guardianType === 'OTHER') return 'Other';
  return app.parentRelation || 'Guardian';
}

function exportCsv(rows) {
  const headers = [
    'Reference',
    'Student',
    'Level',
    'Class',
    'Status',
    'Guardian',
    'Phone',
    'Email',
    'Submitted',
  ];
  const lines = rows.map((a) =>
    [
      a.referenceNumber,
      `${a.studentFirstName} ${a.studentLastName}`,
      LEVEL_LABELS[a.level] || a.level,
      a.classAppliedFor || '',
      a.status,
      a.guardianName || a.parentName || '',
      a.guardianPhone || a.parentPhone || '',
      a.guardianEmail || a.parentEmail || '',
      new Date(a.submittedAt).toLocaleDateString(),
    ]
      .map((v) => `"${String(v || '').replace(/"/g, '""')}"`)
      .join(',')
  );
  const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function DetailBlock({ title, children }) {
  return (
    <div className="text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
      <p className="font-semibold text-rw-navy mb-2">{title}</p>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <p className="py-0.5">
      <span className="text-slate-500">{label}:</span> {value}
    </p>
  );
}

function DocLink({ href, label }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-rw-navy hover:border-rw-blue-300 hover:bg-rw-blue-50/50 transition"
    >
      <FileText size={15} />
      {label}
    </a>
  );
}

export default function ApplicationsAdmin() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailTab, setDetailTab] = useState('summary');
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', adminNotes: '', statusComment: '' });
  const [initialStatus, setInitialStatus] = useState('');
  const [saveError, setSaveError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/applications')
      .then((res) => setApplications(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === 'PENDING').length,
      review: applications.filter((a) => a.status === 'UNDER_REVIEW').length,
      accepted: applications.filter((a) => a.status === 'ACCEPTED').length,
      rejected: applications.filter((a) => a.status === 'REJECTED').length,
      waitlisted: applications.filter((a) => a.status === 'WAITLISTED').length,
      thisWeek: applications.filter((a) => new Date(a.submittedAt).getTime() >= weekAgo).length,
    };
  }, [applications]);

  const classOptions = useMemo(() => {
    const counts = new Map();
    applications.forEach((a) => {
      const key = (a.classAppliedFor || '').trim().toUpperCase();
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
      .map(([value, count]) => ({ value, label: `${value} (${count} applicant${count !== 1 ? 's' : ''})` }));
  }, [applications]);

  const classStatusStats = useMemo(() => {
    if (!classFilter) return null;
    const classRows = applications.filter(
      (a) => (a.classAppliedFor || '').trim().toUpperCase() === classFilter
    );
    return {
      total: classRows.length,
      accepted: classRows.filter((a) => a.status === 'ACCEPTED').length,
      rejected: classRows.filter((a) => a.status === 'REJECTED').length,
      pending: classRows.filter((a) => a.status === 'PENDING').length,
      review: classRows.filter((a) => a.status === 'UNDER_REVIEW').length,
      waitlisted: classRows.filter((a) => a.status === 'WAITLISTED').length,
    };
  }, [applications, classFilter]);

  const filtered = useMemo(() => {
    let list = [...applications];
    if (statusFilter !== 'all') list = list.filter((a) => a.status === statusFilter);
    if (classFilter) {
      list = list.filter((a) => (a.classAppliedFor || '').trim().toUpperCase() === classFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.referenceNumber?.toLowerCase().includes(q) ||
          `${a.studentFirstName} ${a.studentLastName}`.toLowerCase().includes(q) ||
          (a.guardianPhone || a.parentPhone || '').includes(q) ||
          (a.guardianEmail || a.parentEmail || '').toLowerCase().includes(q) ||
          (a.classAppliedFor || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [applications, statusFilter, classFilter, search]);

  const openDetail = async (id) => {
    setSaveError('');
    const { data } = await api.get(`/applications/${id}`);
    setSelected(data);
    setInitialStatus(data.status);
    setStatusForm({
      status: data.status,
      adminNotes: data.adminNotes || '',
      statusComment: '',
    });
    setDetailTab('summary');
    setMobileShowDetail(true);
  };

  const saveStatus = async () => {
    if (!selected) return;
    const statusChanged = statusForm.status !== initialStatus;
    if (statusChanged && !statusForm.statusComment.trim()) {
      setSaveError('Add a comment explaining this status change (visible to the applicant).');
      setDetailTab('history');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const { data } = await api.put(`/applications/${selected.id}`, {
        status: statusForm.status,
        adminNotes: statusForm.adminNotes,
        statusComment: statusChanged ? statusForm.statusComment : undefined,
      });
      setSelected(data);
      setInitialStatus(data.status);
      setStatusForm((f) => ({ ...f, statusComment: '' }));
      setApplications((prev) => prev.map((a) => (a.id === data.id ? { ...a, ...data } : a)));
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const quickStatus = (status) => {
    setStatusForm((f) => ({ ...f, status }));
    setDetailTab('history');
  };

  const deleteApplication = async () => {
    if (!selected || !confirm(`Delete application ${selected.referenceNumber}? This cannot be undone.`)) return;
    await api.delete(`/applications/${selected.id}`);
    setSelected(null);
    setMobileShowDetail(false);
    load();
  };

  const statusChanged = statusForm.status !== initialStatus;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <AdminStatCard label="Total" value={stats.total} icon={ClipboardList} accent="blue" />
        <AdminStatCard label="Pending" value={stats.pending} icon={Hourglass} accent="amber" />
        <AdminStatCard label="In review" value={stats.review} icon={Clock} accent="blue" />
        <AdminStatCard label="Accepted" value={stats.accepted} icon={CheckCircle2} accent="green" />
        <AdminStatCard label="Rejected" value={stats.rejected} icon={XCircle} accent="red" />
        <AdminStatCard label="Waitlisted" value={stats.waitlisted} icon={Users} accent="amber" />
        <AdminStatCard label="This week" value={stats.thisWeek} icon={GraduationCap} accent="green" />
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search reference, student, phone, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rw-blue-500/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminSelect
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="min-w-[220px]"
          >
            <option value="">All classes</option>
            {classOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </AdminSelect>
          <AdminButton variant="secondary" icon={Download} onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
            Export CSV
          </AdminButton>
        </div>
      </div>

      {classFilter && classStatusStats && (
        <AdminCard className="!p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-rw-navy">{classFilter}</span> ({classStatusStats.total}{' '}
              applicant{classStatusStats.total !== 1 ? 's' : ''})
            </p>
            <AdminBadge variant="success">Accepted {classStatusStats.accepted}</AdminBadge>
            <AdminBadge variant="danger">Rejected {classStatusStats.rejected}</AdminBadge>
            <AdminBadge variant="warning">Pending {classStatusStats.pending}</AdminBadge>
            <AdminBadge variant="info">In review {classStatusStats.review}</AdminBadge>
            <AdminBadge variant="default">Waitlisted {classStatusStats.waitlisted}</AdminBadge>
          </div>
        </AdminCard>
      )}

      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((tab) => {
          const count =
            tab.id === 'all'
              ? applications.length
              : applications.filter((a) => a.status === tab.id).length;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-rw-navy text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-rw-blue-200'
              }`}
            >
              {tab.label}
              {count > 0 && <span className="ml-1 opacity-80">{count}</span>}
            </button>
          );
        })}
      </div>

      <AdminCard className="overflow-hidden !p-0 min-h-[520px]" noPadding>
        <div className="flex min-h-[520px]">
          <div
            className={`w-full lg:w-[360px] xl:w-[400px] shrink-0 border-r border-slate-100 flex flex-col ${
              mobileShowDetail ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Applications ({filtered.length})
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <p className="p-8 text-center text-sm text-slate-400 animate-pulse">Loading…</p>
              ) : filtered.length === 0 ? (
                <AdminEmpty message="No applications match your filters." />
              ) : (
                filtered.map((app) => {
                  const active = selected?.id === app.id;
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => openDetail(app.id)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-50 transition flex gap-3 ${
                        active
                          ? 'bg-rw-blue-50 border-l-4 border-l-rw-navy'
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-rw-blue-100 text-rw-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials(app.studentFirstName, app.studentLastName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm text-rw-navy truncate">
                            {app.studentFirstName} {app.studentLastName}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">{relativeTime(app.submittedAt)}</span>
                        </div>
                        <p className="text-xs font-mono text-rw-blue-600 mt-0.5">{app.referenceNumber}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <AdminBadge variant={STATUS_COLORS[app.status]}>
                            {app.status.replace('_', ' ')}
                          </AdminBadge>
                          <span className="text-[10px] text-slate-500">
                            {LEVEL_LABELS[app.level]} · {app.classAppliedFor || '—'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className={`flex-1 flex flex-col min-w-0 ${mobileShowDetail ? 'flex' : 'hidden lg:flex'}`}>
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rw-blue-100 text-rw-blue-600 flex items-center justify-center mb-4">
                  <ClipboardList size={32} />
                </div>
                <h3 className="font-bold text-rw-navy text-lg">Select an application</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-sm">
                  Review student details, documents, update status, and add notes for the admissions team.
                </p>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-slate-100 shrink-0">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setMobileShowDetail(false)}
                      className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-rw-blue-600">{selected.referenceNumber}</p>
                      <h3 className="font-bold text-rw-navy truncate">
                        {selected.studentFirstName} {selected.studentLastName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {LEVEL_LABELS[selected.level]} · {selected.classAppliedFor} ·{' '}
                        {new Date(selected.submittedAt).toLocaleString('en-GB')}
                      </p>
                    </div>
                    <AdminBadge variant={STATUS_COLORS[selected.status]}>
                      {selected.status.replace('_', ' ')}
                    </AdminBadge>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <AdminButton variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => quickStatus('UNDER_REVIEW')}>
                      Start review
                    </AdminButton>
                    <AdminButton variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => quickStatus('ACCEPTED')}>
                      Accept
                    </AdminButton>
                    <AdminButton variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => quickStatus('WAITLISTED')}>
                      Waitlist
                    </AdminButton>
                    <AdminButton variant="danger" className="!px-3 !py-1.5 text-xs" onClick={() => quickStatus('REJECTED')}>
                      Reject
                    </AdminButton>
                    <AdminButton variant="danger" icon={Trash2} className="!px-3 !py-1.5 text-xs ml-auto" onClick={deleteApplication}>
                      Delete
                    </AdminButton>
                  </div>

                  <div className="flex gap-1 mt-3 overflow-x-auto">
                    {DETAIL_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setDetailTab(tab.id)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          detailTab === tab.id
                            ? 'bg-rw-navy text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {detailTab === 'summary' && (
                    <>
                      <DetailBlock title="At a glance">
                        <DetailRow label="Class applied for" value={selected.classAppliedFor} />
                        <DetailRow label="Attendance" value={selected.attendanceType} />
                        <DetailRow label="Guardian" value={`${guardianLabel(selected)} — ${selected.guardianName || selected.parentName}`} />
                        <DetailRow label="Contact" value={selected.guardianPhone || selected.parentPhone} />
                        <DetailRow label="Email" value={selected.guardianEmail || selected.parentEmail} />
                        <DetailRow label="Payment slip" value={selected.paymentSlip ? 'Uploaded' : 'Missing'} />
                      </DetailBlock>
                      {selected.adminNotes && (
                        <DetailBlock title="Internal notes">
                          <p className="text-slate-700 whitespace-pre-wrap">{selected.adminNotes}</p>
                        </DetailBlock>
                      )}
                    </>
                  )}

                  {detailTab === 'student' && (
                    <DetailBlock title="Section A — Student">
                      <div className="grid sm:grid-cols-2 gap-x-4">
                        <DetailRow label="Name" value={`${selected.studentFirstName} ${selected.studentLastName}`} />
                        <DetailRow label="DOB" value={new Date(selected.dateOfBirth).toLocaleDateString()} />
                        <DetailRow label="Gender" value={selected.gender} />
                        <DetailRow label="Nationality" value={selected.nationality} />
                        <DetailRow label="Mother tongue" value={selected.motherTongue} />
                        <DetailRow label="Religion" value={selected.religion} />
                        <DetailRow label="Previous class" value={selected.previousClassAttended} />
                        <DetailRow label="Funding" value={selected.fundingSource} />
                      </div>
                      <p className="mt-2 text-slate-600">
                        {[selected.country === 'OTHER' ? 'Other' : 'Rwanda', selected.province, selected.district, selected.sector, selected.cell, selected.village]
                          .filter(Boolean)
                          .join(' → ')}
                      </p>
                    </DetailBlock>
                  )}

                  {detailTab === 'family' && (
                    <>
                      <DetailBlock title="Father">
                        <DetailRow label="Name" value={selected.fatherName} />
                        <DetailRow label="Phone" value={selected.fatherPhone} />
                        <DetailRow label="ID" value={selected.fatherId} />
                        <DetailRow label="Occupation" value={selected.fatherOccupation} />
                      </DetailBlock>
                      <DetailBlock title="Mother">
                        <DetailRow label="Name" value={selected.motherName} />
                        <DetailRow label="Phone" value={selected.motherPhone} />
                        <DetailRow label="Address" value={selected.motherHomeAddress} />
                        <DetailRow label="Occupation" value={selected.motherOccupation} />
                      </DetailBlock>
                      <DetailBlock title="Guardian">
                        <DetailRow label="Guardian is" value={guardianLabel(selected)} />
                        <DetailRow label="Name" value={selected.guardianName || selected.parentName} />
                        <DetailRow label="Phone" value={selected.guardianPhone || selected.parentPhone} />
                        <DetailRow label="Email" value={selected.guardianEmail || selected.parentEmail} />
                      </DetailBlock>
                      <DetailBlock title="Emergency contact">
                        <DetailRow label="Name" value={selected.emergencyContactName} />
                        <DetailRow label="Phone" value={selected.emergencyContactPhone} />
                        <DetailRow label="Address" value={selected.emergencyContactAddress} />
                      </DetailBlock>
                    </>
                  )}

                  {detailTab === 'documents' && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <DocLink href={selected.paymentSlip} label="Payment slip" />
                      <DocLink href={selected.birthCertificate} label="Birth certificate" />
                      <DocLink href={selected.reportCard} label="Report card" />
                      <DocLink href={selected.studentPhoto} label="Passport photo" />
                      {!selected.paymentSlip && !selected.birthCertificate && !selected.reportCard && !selected.studentPhoto && (
                        <p className="text-sm text-slate-500 col-span-2">No documents uploaded.</p>
                      )}
                    </div>
                  )}

                  {detailTab === 'history' && (
                    <>
                      {selected.statusLogs?.length > 0 ? (
                        <ul className="space-y-2">
                          {selected.statusLogs.map((log) => (
                            <li key={log.id} className="text-sm bg-slate-50 border border-slate-100 rounded-xl p-3">
                              <div className="flex justify-between gap-2">
                                <AdminBadge variant={STATUS_COLORS[log.status]}>
                                  {log.status.replace('_', ' ')}
                                </AdminBadge>
                                <span className="text-xs text-slate-400">
                                  {new Date(log.createdAt).toLocaleString('en-GB')}
                                </span>
                              </div>
                              <p className="text-slate-700 mt-1">{log.comment}</p>
                              {log.adminName && <p className="text-xs text-slate-400 mt-1">— {log.adminName}</p>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500">No status updates yet.</p>
                      )}

                      <div className="pt-4 border-t border-slate-100 space-y-3">
                        <Field label="Status">
                          <select
                            className={inputClass}
                            value={statusForm.status}
                            onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        {statusChanged && (
                          <Field label="Status change comment * (visible to applicant)">
                            <textarea
                              className={inputClass}
                              rows={3}
                              value={statusForm.statusComment}
                              onChange={(e) => setStatusForm({ ...statusForm, statusComment: e.target.value })}
                              placeholder="Explain this decision to the applicant…"
                            />
                          </Field>
                        )}
                        <Field label="Internal admin notes">
                          <textarea
                            className={inputClass}
                            rows={2}
                            value={statusForm.adminNotes}
                            onChange={(e) => setStatusForm({ ...statusForm, adminNotes: e.target.value })}
                            placeholder="Private notes for staff only…"
                          />
                        </Field>
                        {saveError && (
                          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                            {saveError}
                          </p>
                        )}
                        <AdminButton onClick={saveStatus} disabled={saving}>
                          {saving ? 'Saving…' : 'Save changes'}
                        </AdminButton>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
