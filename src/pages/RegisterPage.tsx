import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', department: '', position: '', employeeId: '', phone: '' });
  const s = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.register(form);
      await login(form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 48, width: '100%', maxWidth: 520, boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#0f172a', marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Join your organization's leave management system</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" placeholder="John" value={form.firstName} onChange={s('firstName')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" placeholder="Doe" value={form.lastName} onChange={s('lastName')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={s('email')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={s('password')} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input className="form-input" placeholder="EMP001" value={form.employeeId} onChange={s('employeeId')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+91 9999999999" value={form.phone} onChange={s('phone')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" placeholder="Engineering" value={form.department} onChange={s('department')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Position</label>
              <input className="form-input" placeholder="Software Engineer" value={form.position} onChange={s('position')} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? <><div className="spinner"></div>Creating...</> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
