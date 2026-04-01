import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from || '/';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const dest = user.role === 'landlord' ? '/landlord' : (from === '/' ? '/listings' : from);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo-mark">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><path d="M7 1L1 5.5V13h4V8.5h4V13h4V5.5L7 1z" fill="white"/></svg>
          </div>
          SydneyRent
        </div>
        <div className="auth-hero">
          <h1>Welcome<br/><em>back</em></h1>
          <p>Sign in to access your saved listings, send enquiries, and manage your properties.</p>
        </div>
        <div className="auth-stats">
          <div><strong>2,400+</strong><span>Listings</span></div>
          <div><strong>85+</strong><span>Suburbs</span></div>
          <div><strong>NSW</strong><span>Rights guide</span></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card animate-fade">
          <h2 className="auth-title">Sign in</h2>
          <p className="auth-sub">Don't have an account? <Link to="/register" className="text-green" style={{fontWeight:500}}>Create one</Link></p>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="input-group">
              <label>Email address</label>
              <input className="input" type="email" name="email" placeholder="you@email.com" value={form.email} onChange={handleChange} autoComplete="email" autoFocus />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input className="input" type="password" name="password" placeholder="Your password" value={form.password} onChange={handleChange} autoComplete="current-password" />
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" />Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
