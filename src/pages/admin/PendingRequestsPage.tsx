import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { leaveAPI } from '../../services/api';
import { type Leave } from '../../types';
import { format } from 'date-fns';

const PendingRequestsPage = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaveAPI.getPending().then(r => setLeaves(r.data.leaves)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Pending Requests</h1>
        <p>{leaves.length} request{leaves.length !== 1 ? 's' : ''} awaiting approval</p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ borderColor: '#e2e8f0', borderTopColor: '#2563eb', margin: 'auto' }}></div></div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48 }}>✅</div>
            <h3>All clear!</h3>
            <p>No pending leave requests</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Employee</th><th>Leave Type</th><th>Duration</th><th>Days</th><th>Applied</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {leaves.map(leave => {
                const u = leave.userId as any;
                const lt = leave.leaveTypeId as any;
                return (
                  <tr key={leave._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 13 }}>
                          {u?.firstName?.[0]}{u?.lastName?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{u?.firstName} {u?.lastName}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{u?.department}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: lt?.color || '#2563eb' }}></div>
                        {lt?.name}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{format(new Date(leave.startDate), 'MMM d')} – {format(new Date(leave.endDate), 'MMM d, yyyy')}</td>
                    <td><b>{leave.totalDays}</b></td>
                    <td style={{ fontSize: 13, color: '#64748b' }}>{format(new Date(leave.appliedOn), 'MMM d, yyyy')}</td>
                    <td>
                      <Link to={`/admin/approve/${leave._id}`} className="btn btn-primary btn-sm">Review →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PendingRequestsPage;
