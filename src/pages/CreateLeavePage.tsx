import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { leaveAPI, leaveTypeAPI } from '../services/api';
import { type LeaveType } from '../types';
import toast from 'react-hot-toast';
import { differenceInCalendarDays, format } from 'date-fns';

const CreateLeavePage = () => {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '', isHalfDay: false, halfDayPeriod: 'morning' });
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    leaveTypeAPI.getAll().then(r => setLeaveTypes(r.data.leaveTypes)).catch(() => {});
  }, []);

  const selectedType = leaveTypes.find(l => l._id === form.leaveTypeId);
  const workDayCount = form.startDate && form.endDate && !form.isHalfDay
    ? Math.max(0, differenceInCalendarDays(new Date(form.endDate), new Date(form.startDate)) + 1)
    : form.isHalfDay ? 0.5 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leaveTypeId) { toast.error('Select a leave type'); return; }
    if (!form.startDate || !form.endDate) { toast.error('Select dates'); return; }
    if (new Date(form.startDate) > new Date(form.endDate)) { toast.error('Start date must be before end date'); return; }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, String(v)));
      if (files)
        Array.from(files).forEach((f) => data.append("attachments", f));
      // 👇 PRINT CONTENTS
      // for (const [key, value] of data.entries()) {
      //   console.log(key, value);
      // }
      setSubmitted(true);
      const res = await leaveAPI.create(data);
      toast.success('Leave request submitted!');
      setTimeout(() => navigate(`/leaves/${res.data.leave._id}`), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setLoading(false); }
  };

  if (submitted) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 8 }}>Request Submitted!</h2>
        <p style={{ color: '#64748b' }}>Your leave request is pending approval. Redirecting...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Apply for Leave</h1>
        <p>Submit a new leave request for approval</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Leave Type *</label>
              <select className="form-input" value={form.leaveTypeId} onChange={e => setForm(f => ({ ...f, leaveTypeId: e.target.value }))} required>
                <option value="">Select leave type</option>
                {leaveTypes.map(lt => (
                  <option key={lt._id} value={lt._id}>{lt.name} ({lt.defaultDays} days/year)</option>
                ))}
              </select>
            </div>

            {selectedType && (
              <div style={{ padding: 14, background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd', marginBottom: 18 }}>
                <p style={{ fontSize: 13, color: '#0369a1' }}><b>{selectedType.name}:</b> {selectedType.description || 'No description'}</p>
                {selectedType.requiresDocument && <p style={{ fontSize: 12, color: '#0369a1', marginTop: 4 }}>⚠️ Supporting document required</p>}
                {selectedType.minNoticeDays > 0 && <p style={{ fontSize: 12, color: '#0369a1', marginTop: 2 }}>📅 Min {selectedType.minNoticeDays} days notice required</p>}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input className="form-input" type="date" value={form.startDate} min={format(new Date(), 'yyyy-MM-dd')} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input className="form-input" type="date" value={form.endDate} min={form.startDate || format(new Date(), 'yyyy-MM-dd')} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isHalfDay} onChange={e => setForm(f => ({ ...f, isHalfDay: e.target.checked }))} />
                <span className="form-label" style={{ margin: 0 }}>Half Day Leave</span>
              </label>
            </div>

            {form.isHalfDay && (
              <div className="form-group">
                <label className="form-label">Half Day Period</label>
                <select className="form-input" value={form.halfDayPeriod} onChange={e => setForm(f => ({ ...f, halfDayPeriod: e.target.value }))}>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Reason *</label>
              <textarea className="form-input" placeholder="Please provide a brief reason for your leave..." value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required minLength={10} />
            </div>

            <div className="form-group">
              <label className="form-label">Supporting Documents {selectedType?.requiresDocument ? '*' : '(Optional)'}</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple onChange={e => setFiles(e.target.files)} style={{ display: 'block', fontSize: 14, color: '#475569' }} required={selectedType?.requiresDocument} />
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Max 3 files, 5MB each. PDF, DOCX, JPG, PNG accepted.</p>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><div className="spinner"></div>Submitting...</> : '📤 Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 16 }}>Request Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Leave Type', value: selectedType?.name || '—' },
                { label: 'Start Date', value: form.startDate ? format(new Date(form.startDate), 'MMM d, yyyy') : '—' },
                { label: 'End Date', value: form.endDate ? format(new Date(form.endDate), 'MMM d, yyyy') : '—' },
                { label: 'Duration', value: workDayCount > 0 ? `${workDayCount} day${workDayCount !== 1 ? 's' : ''}` : '—' },
                { label: 'Type', value: form.isHalfDay ? `Half day (${form.halfDayPeriod})` : 'Full day(s)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {form.reason && (
              <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Reason:</p>
                <p style={{ fontSize: 13, color: '#334155' }}>{form.reason}</p>
              </div>
            )}

            <div style={{ marginTop: 16, padding: 12, background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
              <p style={{ fontSize: 12, color: '#92400e' }}>⏳ After submission, your request will be reviewed by the admin/manager. You'll receive a notification once it's processed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLeavePage;
