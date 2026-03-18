import React, { useState, useEffect } from 'react';
import { leaveTypeAPI } from '../../services/api';
import {type LeaveType } from '../../types';
import toast from 'react-hot-toast';

const defaultForm = { name: '', code: '', description: '', defaultDays: 12, color: '#3B82F6', requiresDocument: false, minNoticeDays: 0, maxConsecutiveDays: 30, carryForward: false, maxCarryForwardDays: 0 };

const LeaveTypesPage = () => {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editType, setEditType] = useState<LeaveType | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = () => { leaveTypeAPI.getAllAdmin().then(r => setTypes(r.data.leaveTypes)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditType(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (t: LeaveType) => { setEditType(t); setForm({ name: t.name, code: t.code, description: t.description, defaultDays: t.defaultDays, color: t.color, requiresDocument: t.requiresDocument, minNoticeDays: t.minNoticeDays, maxConsecutiveDays: t.maxConsecutiveDays, carryForward: t.carryForward, maxCarryForwardDays: t.maxCarryForwardDays }); setShowModal(true); };
console.log("types", types);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editType) { await leaveTypeAPI.update(editType._id, form); toast.success('Updated!'); }
      else { await leaveTypeAPI.create(form); toast.success('Leave type created!'); }
      setShowModal(false); load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (t: LeaveType) => {
    if (!window.confirm(`Deactivate "${t.name}"?`)) return;
    try { await leaveTypeAPI.delete(t._id); toast.success('Deactivated'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Leave Types & Policies</h1><p>Define leave categories, quotas, and validation rules</p></div>
        <button onClick={openCreate} className="btn btn-primary">+ Add Leave Type</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderColor: '#e2e8f0', borderTopColor: '#2563eb', margin: 'auto' }}></div></div>
      ) : types.length === 0 ? (
        <div className="card"><div className="empty-state"><div style={{ fontSize: 48 }}>🏷️</div><h3>No leave types</h3><p>Create your first leave type to get started</p></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {types.map(t => (
            <div key={t._id} className="card" style={{ opacity: t.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: t.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: t.color }}></div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{t.name}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>{t.code}</div>
                  </div>
                </div>
                <span className="badge" style={{ background: t.isActive ? '#f0fdf4' : '#fef2f2', color: t.isActive ? '#16a34a' : '#dc2626' }}>{t.isActive ? 'Active' : 'Inactive'}</span>
              </div>

              {t.description && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14, lineHeight: 1.6 }}>{t.description}</p>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, padding: '12px', background: '#f8fafc', borderRadius: 10 }}>
                {[
                  ['📅 Default Allocation', `${t.defaultDays} days/year`],
                  ['🔄 Max Consecutive', `${t.maxConsecutiveDays} days`],
                  ['⏰ Min Notice', `${t.minNoticeDays} day${t.minNoticeDays !== 1 ? 's' : ''}`],
                  ['📎 Document Required', t.requiresDocument ? '✅ Yes' : '❌ No'],
                  ['↩️ Carry Forward', t.carryForward ? `✅ Max ${t.maxCarryForwardDays} days` : '❌ No'],
                ].map(([k, v]) => (
                  <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#94a3b8' }}>{k}</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <button onClick={() => openEdit(t)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>✏️ Edit</button>
                {t.isActive && <button onClick={() => handleDeactivate(t)} className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>Deactivate</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'Playfair Display, serif' }}>{editType ? 'Edit Leave Type' : 'New Leave Type'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Annual Leave" />
                </div>
                <div className="form-group">
                  <label className="form-label">Code *</label>
                  <input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required placeholder="e.g. AL" maxLength={6} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this leave type..." style={{ minHeight: 70 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Default Days/Year *</label>
                  <input className="form-input" type="number" min="0" max="365" value={form.defaultDays} onChange={e => setForm(f => ({ ...f, defaultDays: +e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Consecutive</label>
                  <input className="form-input" type="number" min="1" value={form.maxConsecutiveDays} onChange={e => setForm(f => ({ ...f, maxConsecutiveDays: +e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Notice Days</label>
                  <input className="form-input" type="number" min="0" value={form.minNoticeDays} onChange={e => setForm(f => ({ ...f, minNoticeDays: +e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#334155' }}>
                  <input type="checkbox" checked={form.requiresDocument} onChange={e => setForm(f => ({ ...f, requiresDocument: e.target.checked }))} />
                  📎 Document Required
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#334155' }}>
                  <input type="checkbox" checked={form.carryForward} onChange={e => setForm(f => ({ ...f, carryForward: e.target.checked }))} />
                  ↩️ Carry Forward
                </label>
              </div>

              {form.carryForward && (
                <div className="form-group">
                  <label className="form-label">Max Carry Forward Days</label>
                  <input className="form-input" type="number" min="0" value={form.maxCarryForwardDays} onChange={e => setForm(f => ({ ...f, maxCarryForwardDays: +e.target.value }))} />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 48, height: 36, border: '1.5px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                  <span style={{ fontSize: 13, color: '#64748b' }}>Leave type badge color</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner"></div>Saving...</> : editType ? '💾 Update' : '+ Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTypesPage;
