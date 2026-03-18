import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

type Step = 'email' | 'code' | 'reset';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast.success('Verification code sent to your email!');
      setStep('code');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.verifyCode({ email, code });
      setResetToken(res.data.resetToken);
      toast.success('Code verified!');
      setStep('reset');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Invalid code'); }
    finally { setLoading(false); }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ resetToken, newPassword: password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 48, width: '100%', maxWidth: 440, boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
          {(['email', 'code', 'reset'] as Step[]).map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step === s ? '#2563eb' : ['email','code','reset'].indexOf(step) > i ? '#16a34a' : '#e2e8f0', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ marginTop: 28, marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#0f172a', marginBottom: 6 }}>
            {step === 'email' ? 'Reset Password' : step === 'code' ? 'Enter Code' : 'New Password'}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            {step === 'email' ? 'Enter your email to receive a verification code' :
              step === 'code' ? `We sent a 6-digit code to ${email}` :
              'Choose a strong new password'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={sendCode}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? <><div className="spinner"></div>Sending...</> : 'Get Verification Code'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={verifyCode}>
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input className="form-input" type="text" placeholder="123456" value={code} onChange={e => setCode(e.target.value)} maxLength={6} style={{ textAlign: 'center', letterSpacing: 8, fontSize: 22, fontWeight: 700 }} required />
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>Check your inbox — the code expires in 15 minutes.</p>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || code.length !== 6}>
              {loading ? <><div className="spinner"></div>Verifying...</> : 'Verify Code'}
            </button>
            <button type="button" onClick={() => setStep('email')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
              Resend Code
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={resetPassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="Re-enter password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <><div className="spinner"></div>Resetting...</> : 'Reset Password'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b' }}>
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
