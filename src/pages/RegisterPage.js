import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step,    setStep]    = useState(1);
  const [role,    setRole]    = useState('');
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '', phone: '', agency: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim())       return setError('Please enter your full name.');
    if (!form.email.trim())      return setError('Please enter your email.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, role, phone: form.phone, agency: form.agency });
      navigate(user.role === 'landlord' ? '/landlord' : '/listings', { replace: true });
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
          <h1>Start your<br/><em>journey</em></h1>
          <p>Join thousands of tenants and landlords using SydneyRent to find and list properties across Sydney.</p>
        </div>
        <div className="auth-stats">
          <div><strong>Free</strong><span>To register</span></div>
          <div><strong>2</strong><span>Account types</span></div>
          <div><strong>NSW</strong><span>Rights guide</span></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card animate-fade">
          {step === 1 ? (
            <>
              <h2 className="auth-title">Create an account</h2>
              <p className="auth-sub">How will you use SydneyRent?</p>

              <div className="role-cards">
                <button className="role-card" onClick={() => { setRole('tenant'); setStep(2); }}>
                  <span className="role-icon">🏠</span>
                  <div className="role-card-title">I'm a Tenant</div>
                  <div className="role-card-desc">Looking for a rental in Sydney</div>
                  <ul className="role-perks">
                    <li>✓ Search &amp; filter listings</li>
                    <li>✓ Save favourites</li>
                    <li>✓ Contact landlords</li>
                    <li>✓ NSW renting guide</li>
                  </ul>
                </button>
                <button className="role-card" onClick={() => { setRole('landlord'); setStep(2); }}>
                  <span className="role-icon">🔑</span>
                  <div className="role-card-title">I'm a Landlord / Agent</div>
                  <div className="role-card-desc">I want to list properties for rent</div>
                  <ul className="role-perks">
                    <li>✓ Post listings</li>
                    <li>✓ Manage enquiries</li>
                    <li>✓ Track views</li>
                    <li>✓ Reach newcomers</li>
                  </ul>
                </button>
              </div>

              <p className="auth-sub" style={{marginTop:16}}>Already have an account? <Link to="/login" className="text-green" style={{fontWeight:500}}>Sign in</Link></p>
            </>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm">← Back</button>
                <span className={`badge badge-${role === 'landlord' ? 'green' : 'blue'}`}>
                  {role === 'landlord' ? '🔑 Landlord' : '🏠 Tenant'}
                </span>
              </div>
              <h2 className="auth-title">Your details</h2>
              <p className="auth-sub">Already have an account? <Link to="/login" className="text-green" style={{fontWeight:500}}>Sign in</Link></p>

              <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="input-group">
                  <label>Full name</label>
                  <input className="input" name="name" placeholder="Jane Smith" value={form.name} onChange={set} />
                </div>
                <div className="input-group">
                  <label>Email address</label>
                  <input className="input" type="email" name="email" placeholder="you@email.com" value={form.email} onChange={set} />
                </div>
                {role === 'landlord' && (
                  <div className="input-group">
                    <label>Agency <span className="text-muted text-small">(optional)</span></label>
                    <input className="input" name="agency" placeholder="e.g. Ray White, LJ Hooker" value={form.agency} onChange={set} />
                  </div>
                )}
                <div className="input-group">
                  <label>Phone <span className="text-muted text-small">(optional)</span></label>
                  <input className="input" name="phone" placeholder="+61 4xx xxx xxx" value={form.phone} onChange={set} />
                </div>
                <div className="auth-row-2">
                  <div className="input-group">
                    <label>Password</label>
                    <input className="input" type="password" name="password" placeholder="Min. 6 chars" value={form.password} onChange={set} />
                  </div>
                  <div className="input-group">
                    <label>Confirm password</label>
                    <input className="input" type="password" name="confirm" placeholder="Repeat" value={form.confirm} onChange={set} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                  {loading ? <><div className="spinner" />Creating account…</> : 'Create account'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
