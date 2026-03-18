import React, { useState, useEffect } from 'react';
import { reportAPI, userAPI } from '../../services/api';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#9333ea', '#0ea5e9', '#f59e0b'];

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`,
    department: '',
    status: '',
  });

  useEffect(() => {
    userAPI.getDepartments().then(r => setDepartments(r.data.departments)).catch(() => {});
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getLeaveReport(filters);
      setData(res.data);
    } catch {}
    setLoading(false);
  };

  const exportCSV = () => {
    if (!data) return;
    const rows = [['Employee', 'Email', 'Department', 'Leave Type', 'Start', 'End', 'Days', 'Status', 'Applied On']];
    data.leaves.forEach((l: any) => {
      const u = l.userId; const lt = l.leaveTypeId;
      rows.push([`${u?.firstName} ${u?.lastName}`, u?.email, u?.department, lt?.name,
        format(new Date(l.startDate), 'MMM d yyyy'), format(new Date(l.endDate), 'MMM d yyyy'),
        l.totalDays, l.status, format(new Date(l.appliedOn), 'MMM d yyyy')]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `leave-report-${filters.startDate}-${filters.endDate}.csv`; a.click();
  };

  const deptChartData = data ? Object.entries(data.byDepartment).map(([name, val]: any) => ({ name, count: val.count, days: val.days })) : [];
  const typeChartData = data ? Object.entries(data.byLeaveType).map(([name, val]: any) => ({ name, value: val.count })) : [];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Reports & Analytics</h1><p>Leave reports by department, period, and type</p></div>
        {data && <button onClick={exportCSV} className="btn btn-secondary">📥 Export CSV</button>}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Start Date</label>
            <input className="form-input" type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} style={{ width: 170 }} />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input className="form-input" type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} style={{ width: 170 }} />
          </div>
          <div>
            <label className="form-label">Department</label>
            <select className="form-input" style={{ width: 180 }} value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-input" style={{ width: 150 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Status</option>
              {['pending','approved','rejected','cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
          </div>
          <button onClick={loadReport} className="btn btn-primary" disabled={loading}>
            {loading ? <><div className="spinner"></div>Loading...</> : '🔍 Generate Report'}
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Requests', value: data.summary.total, color: '#2563eb', bg: '#eff6ff' },
              { label: 'Approved', value: data.summary.approved, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Pending', value: data.summary.pending, color: '#d97706', bg: '#fffbeb' },
              { label: 'Rejected', value: data.summary.rejected, color: '#dc2626', bg: '#fef2f2' },
              { label: 'Total Days Taken', value: data.summary.totalDays, color: '#9333ea', bg: '#fdf4ff' },
            ].map(c => (
              <div key={c.label} className="stat-card">
                <div className="stat-icon" style={{ background: c.bg }}><span style={{ fontSize: 22, color: c.color }}>📊</span></div>
                <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div className="card">
              <h3 style={{ fontSize: 15, marginBottom: 20 }}>By Department</h3>
              {deptChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={deptChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[4,4,0,0]} name="Requests" />
                    <Bar dataKey="days" fill="#0ea5e9" radius={[4,4,0,0]} name="Days" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="empty-state"><p>No data</p></div>}
            </div>
            <div className="card">
              <h3 style={{ fontSize: 15, marginBottom: 20 }}>By Leave Type</h3>
              {typeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={typeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${((percent ?? 0)*100).toFixed(0)}%)`} labelLine={false}>
                      {typeChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="empty-state"><p>No data</p></div>}
            </div>
          </div>

          {/* Detailed Table */}
          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 20 }}>Detailed Records ({data.leaves.length})</h3>
            {data.leaves.length === 0 ? (
              <div className="empty-state"><div style={{ fontSize: 40 }}>📋</div><h3>No records found</h3><p>Try adjusting filters</p></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>Employee</th><th>Dept</th><th>Leave Type</th><th>Start</th><th>End</th><th>Days</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.leaves.map((l: any) => {
                      const u = l.userId; const lt = l.leaveTypeId;
                      return (
                        <tr key={l._id}>
                          <td><div style={{ fontWeight: 500, fontSize: 14 }}>{u?.firstName} {u?.lastName}</div><div style={{ fontSize: 12, color: '#64748b' }}>{u?.email}</div></td>
                          <td style={{ fontSize: 13 }}>{u?.department}</td>
                          <td><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: lt?.color || '#2563eb', flexShrink: 0, display: 'inline-block' }}></span>{lt?.name}</span></td>
                          <td style={{ fontSize: 13 }}>{format(new Date(l.startDate), 'MMM d, yyyy')}</td>
                          <td style={{ fontSize: 13 }}>{format(new Date(l.endDate), 'MMM d, yyyy')}</td>
                          <td><b>{l.totalDays}</b></td>
                          <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
