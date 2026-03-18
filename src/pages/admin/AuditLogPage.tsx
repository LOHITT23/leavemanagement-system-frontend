import React, { useState, useEffect } from 'react';
import { auditAPI } from '../../services/api';
import { type AuditLog } from '../../types';
import { format } from 'date-fns';

const actionColors: Record<string, { bg: string; color: string }> = {
  LOGIN: { bg: '#eff6ff', color: '#2563eb' },
  CREATE: { bg: '#f0fdf4', color: '#16a34a' },
  UPDATE: { bg: '#fffbeb', color: '#d97706' },
  DELETE: { bg: '#fef2f2', color: '#dc2626' },
  APPROVED: { bg: '#f0fdf4', color: '#16a34a' },
  REJECTED: { bg: '#fef2f2', color: '#dc2626' },
};

const AuditLogPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entityFilter, setEntityFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await auditAPI.getLogs({ page, limit: 50, entity: entityFilter });
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, entityFilter]);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Audit Log</h1><p>Full trail of all system actions · {total} total entries</p></div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Filter by Entity</label>
            <select className="form-input" style={{ width: 180 }} value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(1); }}>
              <option value="">All Entities</option>
              {['Auth', 'Leave', 'User', 'LeaveType', 'Settings'].map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setEntityFilter(''); setPage(1); }}>Clear</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ width: 30, height: 30, borderColor: '#e2e8f0', borderTopColor: '#2563eb', margin: 'auto' }}></div></div>
        ) : logs.length === 0 ? (
          <div className="empty-state"><div style={{ fontSize: 48 }}>🔍</div><h3>No audit logs</h3><p>System actions will appear here</p></div>
        ) : (
          <>
            <table>
              <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th><th>IP</th></tr></thead>
              <tbody>
                {logs.map(log => {
                  const c = actionColors[log.action] || { bg: '#f1f5f9', color: '#64748b' };
                  return (
                    <tr key={log._id}>
                      <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                        <div>{format(new Date(log.createdAt), 'MMM d, yyyy')}</div>
                        <div style={{ color: '#94a3b8' }}>{format(new Date(log.createdAt), 'h:mm:ss a')}</div>
                      </td>
                      <td>
                        {log.userId ? (
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{(log.userId as any).firstName} {(log.userId as any).lastName}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{(log.userId as any).email}</div>
                          </div>
                        ) : <span style={{ color: '#94a3b8' }}>—</span>}
                      </td>
                      <td><span className="badge" style={{ background: c.bg, color: c.color }}>{log.action}</span></td>
                      <td><span style={{ fontSize: 12, fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>{log.entity}</span></td>
                      <td style={{ fontSize: 13, color: '#475569', maxWidth: 280 }}>{log.details}</td>
                      <td style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{log.ipAddress || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ padding: '6px 14px', fontSize: 14, color: '#475569' }}>Page {page} of {totalPages}</span>
                <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;
