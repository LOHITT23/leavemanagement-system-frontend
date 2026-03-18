import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { User } from '../types';

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Design', 'Legal'];

const defaultForm = { name: '', email: '', password: '', department: '', position: '', employeeId: '', phone: '', role: 'employee' as User['role'], isActive: true };

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (search) params.append('search', search);
      if (deptFilter) params.append('department', deptFilter);
      const { data } = await api.get(`/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [page, search, deptFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditing(null); setForm(defaultForm); setError(''); setShowModal(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ ...defaultForm, ...u, password: '' }); setError(''); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editing) {
        const { password, ...rest } = form;
        await api.put(`/users/${editing.id}`, rest);
      } else {
        await api.post('/users', form);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm('Deactivate this user?')) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">{total} users in the system</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <input className="form-control" placeholder="Search name, email, ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ minWidth: '220px' }} />
          <select className="form-control" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>➕ Add User</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : users.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-title">No users found</div></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><div style={{ fontWeight: 500 }}>{u.firstName}</div><div style={{ fontSize: '.8rem', color: 'var(--gray-500)' }}>{u.employeeId}</div></td>
                    <td style={{ fontSize: '.875rem' }}>{u.email}</td>
                    <td>{u.department}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-rejected' : u.role === 'manager' ? 'badge-pending' : 'badge-approved'}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.isActive ? 'badge-approved' : 'badge-cancelled'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(u)}>Edit</button>
                        {u.isActive && <button className="btn btn-sm btn-danger" onClick={() => handleDeactivate(u.id)}>Deactivate</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit User' : 'Add New User'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-error">⚠️ {error}</div>}
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Full Name <span>*</span></label><input className="form-control" value={form.name} onChange={set('name')} required /></div>
                  <div className="form-group"><label className="form-label">Employee ID <span>*</span></label><input className="form-control" value={form.employeeId} onChange={set('employeeId')} required disabled={!!editing} /></div>
                </div>
                <div className="form-group"><label className="form-label">Email <span>*</span></label><input className="form-control" type="email" value={form.email} onChange={set('email')} required /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Department <span>*</span></label><select className="form-control" value={form.department} onChange={set('department')} required><option value="">Select...</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Position <span>*</span></label><input className="form-control" value={form.position} onChange={set('position')} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Role <span>*</span></label><select className="form-control" value={form.role} onChange={set('role')}><option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option></select></div>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-control" type="tel" value={form.phone} onChange={set('phone')} /></div>
                </div>
                {!editing && <div className="form-group"><label className="form-label">Password</label><input className="form-control" type="password" placeholder="Default: Password@123" value={form.password} onChange={set('password')} /><div className="form-hint">Leave blank for default password</div></div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving...' : editing ? 'Update User' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
