import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { type User } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', department: '', position: '', employeeId: '', phone: '', role: 'employee' as const, managerId: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ search, role: roleFilter, limit: 50 });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const openCreate = () => { setEditUser(null); setForm({ firstName: '', lastName: '', email: '', password: '', department: '', position: '', employeeId: '', phone: '', role: 'employee', managerId: '' }); setShowModal(true); };
  const openEdit = (user: User) => { setEditUser(user); setForm({ ...user as any, password: '' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editUser) {
        const { password, ...data } = form;
        await userAPI.update(editUser._id, data);
        toast.success('User updated!');
      } else {
        await userAPI.create(form);
        toast.success('User created!');
      }
      setShowModal(false);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Deactivate ${user.firstName} ${user.lastName}?`)) return;
    try {
      console.log("user",user);
      
      await userAPI.delete(user._id);
      toast.success('User deactivated');
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>User Management</h1>
          <p>{total} total users</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">+ Add User</button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <input className="form-input" style={{ width: 240 }} placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-input" style={{ width: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: 'auto', borderColor: '#e2e8f0', borderTopColor: '#2563eb' }}></div></div> :
          <table>
            <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 13 }}>
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{u.firstName} {u.lastName}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td style={{ fontSize: 13 }}>{u.department}</td>
                  <td><span className="badge" style={{ background: u.isActive ? '#f0fdf4' : '#fef2f2', color: u.isActive ? '#16a34a' : '#dc2626' }}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(u)} className="btn btn-secondary btn-sm">Edit</button>
                      {u.isActive && <button onClick={() => handleDelete(u)} className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>Deactivate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editUser ? 'Edit User' : 'Create User'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              {!editUser && (
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input className="form-input" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Position</label>
                  <input className="form-input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} required />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editUser ? 'Save Changes' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
