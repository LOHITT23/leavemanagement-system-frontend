import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const OrgSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    orgName: '',
    workDays: [1, 2, 3, 4, 5],
    fiscalYearStart: 1,
    timezone: 'Asia/Kolkata',
    leaveApprovalLevels: 1,
    holidays: [] as { date: string; name: string }[],
  });
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });

  useEffect(() => {
    settingsAPI.get().then(r => {
      const s = r.data.settings;
      setSettings({
        orgName: s.orgName || '',
        workDays: s.workDays || [1,2,3,4,5],
        fiscalYearStart: s.fiscalYearStart || 1,
        timezone: s.timezone || 'Asia/Kolkata',
        leaveApprovalLevels: s.leaveApprovalLevels || 1,
        holidays: (s.holidays || []).map((h: any) => ({ date: h.date.substring(0, 10), name: h.name })),
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleWorkDay = (day: number) => {
    setSettings(s => ({
      ...s,
      workDays: s.workDays.includes(day) ? s.workDays.filter(d => d !== day) : [...s.workDays, day].sort(),
    }));
  };

  const addHoliday = () => {
    if (!newHoliday.date || !newHoliday.name.trim()) { toast.error('Enter date and holiday name'); return; }
    setSettings(s => ({ ...s, holidays: [...s.holidays, { ...newHoliday }].sort((a, b) => a.date.localeCompare(b.date)) }));
    setNewHoliday({ date: '', name: '' });
  };

  const removeHoliday = (idx: number) => setSettings(s => ({ ...s, holidays: s.holidays.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Settings saved!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" style={{ borderColor: '#e2e8f0', borderTopColor: '#2563eb' }}></div></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Organization Settings</h1><p>Configure workdays, holidays, and org structure</p></div>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          {saving ? <><div className="spinner"></div>Saving...</> : '💾 Save Settings'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* General */}
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>General</h3>
          <div className="form-group">
            <label className="form-label">Organization Name</label>
            <input className="form-input" value={settings.orgName} onChange={e => setSettings(s => ({ ...s, orgName: e.target.value }))} placeholder="Your Company Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select className="form-input" value={settings.timezone} onChange={e => setSettings(s => ({ ...s, timezone: e.target.value }))}>
              {['Asia/Kolkata', 'Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Singapore', 'Asia/Dubai'].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fiscal Year Start</label>
            <select className="form-input" value={settings.fiscalYearStart} onChange={e => setSettings(s => ({ ...s, fiscalYearStart: +e.target.value }))}>
              {MONTH_NAMES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Approval Levels</label>
            <select className="form-input" value={settings.leaveApprovalLevels} onChange={e => setSettings(s => ({ ...s, leaveApprovalLevels: +e.target.value }))}>
              <option value={1}>1 Level (Manager/Admin)</option>
              <option value={2}>2 Levels (Manager then Admin)</option>
            </select>
          </div>
        </div>

        {/* Work Days */}
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>Work Days</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Select the days that count as working days:</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {DAY_NAMES.map((day, i) => {
              const active = settings.workDays.includes(i);
              return (
                <button key={i} type="button" onClick={() => toggleWorkDay(i)} style={{
                  width: 56, height: 56, borderRadius: 12, border: `2px solid ${active ? '#2563eb' : '#e2e8f0'}`,
                  background: active ? '#eff6ff' : 'white', color: active ? '#2563eb' : '#94a3b8',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  {day}
                </button>
              );
            })}
          </div>
          <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10, fontSize: 13, color: '#475569' }}>
            <b>Working days:</b> {settings.workDays.map(d => DAY_NAMES[d]).join(', ') || 'None selected'}
          </div>
        </div>

        {/* Holidays */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>Public Holidays</h3>

          {/* Add new */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 0.4 }}>
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={newHoliday.date} onChange={e => setNewHoliday(h => ({ ...h, date: e.target.value }))} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Holiday Name</label>
              <input className="form-input" placeholder="e.g. Republic Day" value={newHoliday.name} onChange={e => setNewHoliday(h => ({ ...h, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addHoliday()} />
            </div>
            <button type="button" onClick={addHoliday} className="btn btn-primary">+ Add</button>
          </div>

          {settings.holidays.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🗓️</div>
              <h3>No holidays added</h3>
              <p>Add public holidays to exclude them from leave counts</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {settings.holidays.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <button onClick={() => removeHoliday(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16, padding: 4, borderRadius: 6 }} title="Remove">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgSettingsPage;
