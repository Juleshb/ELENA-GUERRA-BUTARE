import { useEffect, useState } from 'react';
import api from '../../api/client';
import { CircleHelp, ClipboardList, FileText, Wallet } from 'lucide-react';
import CrudTable, { AdminBadge } from '../../components/admin/CrudTable';
import FormModal, { Field, inputClass, CheckboxField } from '../../components/admin/FormModal';
import { AdminButton, AdminSection, AdminStatCard, AdminToolbar } from '../../components/admin/AdminUI';

export default function AdmissionsAdmin() {
  const [data, setData] = useState(null);
  const [protocolForm, setProtocolForm] = useState({});
  const [saved, setSaved] = useState(false);

  const [stepModal, setStepModal] = useState(false);
  const [stepForm, setStepForm] = useState({ stepNumber: 1, title: '', description: '', published: true });
  const [editingStepId, setEditingStepId] = useState(null);

  const [reqModal, setReqModal] = useState(false);
  const [reqForm, setReqForm] = useState({
    category: 'Documents',
    title: '',
    description: '',
    level: 'All levels',
    order: 0,
    published: true,
  });
  const [editingReqId, setEditingReqId] = useState(null);

  const [feeModal, setFeeModal] = useState(false);
  const [feeForm, setFeeForm] = useState({ level: '', amount: '', description: '', order: 0, published: true });
  const [editingFeeId, setEditingFeeId] = useState(null);

  const [faqModal, setFaqModal] = useState(false);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', order: 0, published: true });
  const [editingFaqId, setEditingFaqId] = useState(null);

  const load = () => {
    api.get('/admissions?admin=true').then((res) => {
      setData(res.data);
      setProtocolForm(res.data.protocol || {});
    });
  };

  useEffect(() => {
    load();
  }, []);

  const saveProtocol = async (e) => {
    e.preventDefault();
    await api.put('/admissions/protocol', protocolForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    load();
  };

  const saveStep = async () => {
    if (editingStepId) await api.put(`/admissions/steps/${editingStepId}`, stepForm);
    else await api.post('/admissions/steps', stepForm);
    setStepModal(false);
    load();
  };

  const saveReq = async () => {
    if (editingReqId) await api.put(`/admissions/requirements/${editingReqId}`, reqForm);
    else await api.post('/admissions/requirements', reqForm);
    setReqModal(false);
    load();
  };

  const saveFee = async () => {
    if (editingFeeId) await api.put(`/admissions/fees/${editingFeeId}`, feeForm);
    else await api.post('/admissions/fees', feeForm);
    setFeeModal(false);
    load();
  };

  const saveFaq = async () => {
    if (editingFaqId) await api.put(`/admissions/faqs/${editingFaqId}`, faqForm);
    else await api.post('/admissions/faqs', faqForm);
    setFaqModal(false);
    load();
  };

  if (!data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-white rounded-2xl border border-slate-200/80" />
        <div className="h-48 bg-white rounded-2xl border border-slate-200/80" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl">
      <AdminToolbar stats="Admissions dashboard for protocol content">
        <AdminBadge variant={protocolForm.published !== false ? 'success' : 'draft'}>
          {protocolForm.published !== false ? 'Published' : 'Draft'}
        </AdminBadge>
      </AdminToolbar>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard label="Process steps" value={(data.steps || []).length} icon={ClipboardList} accent="blue" />
        <AdminStatCard label="Requirements" value={(data.requirements || []).length} icon={FileText} accent="amber" />
        <AdminStatCard label="Registration fees" value={(data.fees || []).length} icon={Wallet} accent="green" />
        <AdminStatCard label="FAQs" value={(data.faqs || []).length} icon={CircleHelp} accent="red" />
      </div>

      <AdminSection
        title="Overview & contact"
        description="Main introduction, deadline note, and contact details shown on /admissions"
      >
        <form onSubmit={saveProtocol} className="space-y-4">
        <Field label="Introduction">
          <textarea
            className={inputClass}
            rows={3}
            value={protocolForm.intro || ''}
            onChange={(e) => setProtocolForm({ ...protocolForm, intro: e.target.value })}
          />
        </Field>
        <Field label="Overview">
          <textarea
            className={inputClass}
            rows={3}
            value={protocolForm.overview || ''}
            onChange={(e) => setProtocolForm({ ...protocolForm, overview: e.target.value })}
          />
        </Field>
        <Field label="Deadline Note">
          <textarea
            className={inputClass}
            rows={2}
            value={protocolForm.deadlineNote || ''}
            onChange={(e) => setProtocolForm({ ...protocolForm, deadlineNote: e.target.value })}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Admissions Email">
            <input
              className={inputClass}
              value={protocolForm.applicationEmail || ''}
              onChange={(e) => setProtocolForm({ ...protocolForm, applicationEmail: e.target.value })}
            />
          </Field>
          <Field label="Admissions Phone">
            <input
              className={inputClass}
              value={protocolForm.applicationPhone || ''}
              onChange={(e) => setProtocolForm({ ...protocolForm, applicationPhone: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Office Hours">
          <input
            className={inputClass}
            value={protocolForm.officeHours || ''}
            onChange={(e) => setProtocolForm({ ...protocolForm, officeHours: e.target.value })}
          />
        </Field>
        <CheckboxField
          label="Published on website"
          checked={protocolForm.published !== false}
          onChange={(e) => setProtocolForm({ ...protocolForm, published: e.target.checked })}
        />
        <div className="flex items-center gap-3">
          <AdminButton type="submit" variant="primary">
            Save protocol
          </AdminButton>
          {saved && <span className="text-emerald-600 text-sm font-medium">Saved!</span>}
        </div>
        </form>
      </AdminSection>

      <AdminSection
        title="Process steps"
        description="Student journey shown in the admissions process timeline"
        action={
          <AdminButton
            onClick={() => {
              setStepForm({
                stepNumber: (data.steps?.length || 0) + 1,
                title: '',
                description: '',
                published: true,
              });
              setEditingStepId(null);
              setStepModal(true);
            }}
          >
            Add step
          </AdminButton>
        }
      >
        <CrudTable
          columns={[
            { key: 'stepNumber', label: '#' },
            { key: 'title', label: 'Title' },
            {
              key: 'published',
              label: 'Status',
              render: (r) => (
                <AdminBadge variant={r.published ? 'success' : 'draft'}>
                  {r.published ? 'Published' : 'Draft'}
                </AdminBadge>
              ),
            },
          ]}
          rows={data.steps || []}
          onEdit={(row) => {
            setStepForm(row);
            setEditingStepId(row.id);
            setStepModal(true);
          }}
          onDelete={async (id) => {
            if (!confirm('Delete this step?')) return;
            await api.delete(`/admissions/steps/${id}`);
            load();
          }}
        />
      </AdminSection>

      <AdminSection
        title="Requirements"
        description="Checklist grouped by eligibility, documents, and assessment"
        action={
          <AdminButton
            onClick={() => {
              setReqForm({
                category: 'Documents',
                title: '',
                description: '',
                level: 'All levels',
                order: 0,
                published: true,
              });
              setEditingReqId(null);
              setReqModal(true);
            }}
          >
            Add requirement
          </AdminButton>
        }
      >
        <CrudTable
          columns={[
            { key: 'category', label: 'Category' },
            { key: 'title', label: 'Title' },
            { key: 'level', label: 'Level' },
          ]}
          rows={data.requirements || []}
          onEdit={(row) => {
            setReqForm(row);
            setEditingReqId(row.id);
            setReqModal(true);
          }}
          onDelete={async (id) => {
            if (!confirm('Delete?')) return;
            await api.delete(`/admissions/requirements/${id}`);
            load();
          }}
        />
      </AdminSection>

      <AdminSection
        title="Registration fees"
        description="Fee cards displayed by study level"
        action={
          <AdminButton
            onClick={() => {
              setFeeForm({ level: '', amount: '', description: '', order: 0, published: true });
              setEditingFeeId(null);
              setFeeModal(true);
            }}
          >
            Add fee
          </AdminButton>
        }
      >
        <CrudTable
          columns={[
            { key: 'level', label: 'Level' },
            { key: 'amount', label: 'Amount' },
          ]}
          rows={data.fees || []}
          onEdit={(row) => {
            setFeeForm(row);
            setEditingFeeId(row.id);
            setFeeModal(true);
          }}
          onDelete={async (id) => {
            if (!confirm('Delete?')) return;
            await api.delete(`/admissions/fees/${id}`);
            load();
          }}
        />
      </AdminSection>

      <AdminSection
        title="FAQs"
        description="Shown in the admissions explore section"
        action={
          <AdminButton
            onClick={() => {
              setFaqForm({ question: '', answer: '', order: 0, published: true });
              setEditingFaqId(null);
              setFaqModal(true);
            }}
          >
            Add FAQ
          </AdminButton>
        }
      >
        <CrudTable
          columns={[
            { key: 'question', label: 'Question' },
            {
              key: 'published',
              label: 'Status',
              render: (r) => (
                <AdminBadge variant={r.published ? 'success' : 'draft'}>
                  {r.published ? 'Published' : 'Draft'}
                </AdminBadge>
              ),
            },
          ]}
          rows={data.faqs || []}
          onEdit={(row) => {
            setFaqForm(row);
            setEditingFaqId(row.id);
            setFaqModal(true);
          }}
          onDelete={async (id) => {
            if (!confirm('Delete?')) return;
            await api.delete(`/admissions/faqs/${id}`);
            load();
          }}
        />
      </AdminSection>

      <FormModal
        title={editingStepId ? 'Edit Step' : 'Add Step'}
        open={stepModal}
        onClose={() => setStepModal(false)}
        onSubmit={saveStep}
      >
        <Field label="Step Number">
          <input
            type="number"
            className={inputClass}
            value={stepForm.stepNumber}
            onChange={(e) => setStepForm({ ...stepForm, stepNumber: parseInt(e.target.value, 10) })}
            required
          />
        </Field>
        <Field label="Title">
          <input
            className={inputClass}
            value={stepForm.title}
            onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
            required
          />
        </Field>
        <Field label="Description">
          <textarea
            className={inputClass}
            rows={4}
            value={stepForm.description}
            onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
            required
          />
        </Field>
        <CheckboxField
          label="Published"
          checked={stepForm.published}
          onChange={(e) => setStepForm({ ...stepForm, published: e.target.checked })}
        />
      </FormModal>

      <FormModal
        title={editingReqId ? 'Edit Requirement' : 'Add Requirement'}
        open={reqModal}
        onClose={() => setReqModal(false)}
        onSubmit={saveReq}
      >
        <Field label="Category">
          <select
            className={inputClass}
            value={reqForm.category}
            onChange={(e) => setReqForm({ ...reqForm, category: e.target.value })}
          >
            <option>Eligibility</option>
            <option>Documents</option>
            <option>Assessment</option>
          </select>
        </Field>
        <Field label="Title">
          <input
            className={inputClass}
            value={reqForm.title}
            onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })}
            required
          />
        </Field>
        <Field label="Description">
          <textarea
            className={inputClass}
            rows={3}
            value={reqForm.description || ''}
            onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
          />
        </Field>
        <Field label="Level">
          <input
            className={inputClass}
            value={reqForm.level || ''}
            onChange={(e) => setReqForm({ ...reqForm, level: e.target.value })}
            placeholder="e.g. All levels, Primary, O-Level"
          />
        </Field>
        <Field label="Sort Order">
          <input
            type="number"
            className={inputClass}
            value={reqForm.order}
            onChange={(e) => setReqForm({ ...reqForm, order: parseInt(e.target.value, 10) })}
          />
        </Field>
        <CheckboxField
          label="Published"
          checked={reqForm.published}
          onChange={(e) => setReqForm({ ...reqForm, published: e.target.checked })}
        />
      </FormModal>

      <FormModal
        title={editingFeeId ? 'Edit Fee' : 'Add Fee'}
        open={feeModal}
        onClose={() => setFeeModal(false)}
        onSubmit={saveFee}
      >
        <Field label="Level">
          <input
            className={inputClass}
            value={feeForm.level}
            onChange={(e) => setFeeForm({ ...feeForm, level: e.target.value })}
            required
          />
        </Field>
        <Field label="Amount">
          <input
            className={inputClass}
            value={feeForm.amount}
            onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
            placeholder="e.g. 25,000 RWF"
            required
          />
        </Field>
        <Field label="Notes">
          <input
            className={inputClass}
            value={feeForm.description || ''}
            onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
          />
        </Field>
        <CheckboxField
          label="Published"
          checked={feeForm.published}
          onChange={(e) => setFeeForm({ ...feeForm, published: e.target.checked })}
        />
      </FormModal>

      <FormModal
        title={editingFaqId ? 'Edit FAQ' : 'Add FAQ'}
        open={faqModal}
        onClose={() => setFaqModal(false)}
        onSubmit={saveFaq}
      >
        <Field label="Question">
          <input
            className={inputClass}
            value={faqForm.question}
            onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
            required
          />
        </Field>
        <Field label="Answer">
          <textarea
            className={inputClass}
            rows={4}
            value={faqForm.answer}
            onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
            required
          />
        </Field>
        <Field label="Sort Order">
          <input
            type="number"
            className={inputClass}
            value={faqForm.order}
            onChange={(e) => setFaqForm({ ...faqForm, order: parseInt(e.target.value, 10) })}
          />
        </Field>
        <CheckboxField
          label="Published"
          checked={faqForm.published}
          onChange={(e) => setFaqForm({ ...faqForm, published: e.target.checked })}
        />
      </FormModal>
    </div>
  );
}
