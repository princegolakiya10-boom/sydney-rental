import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();

  const [form,     setForm]     = useState({ name: user?.name||'', phone: user?.phone||'', agency: user?.agency||'' });
  const [pwForm,   setPwForm]   = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [saving,   setSaving]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [pwSaved,  setPwSaved]  = useState(false);
  const [error,    setError]    = useState('');
  const [pwError,  setPwError]  = useState('');

  if (!user) return (
    <div className="page-container" style={{textAlign:'center', padding:'80px 24px'}}>
      <h2>Please log in</h2>
      <Link to="/login" className="btn btn-primary" style={{marginTop:16}}>Log in</Link>
    </div>
  );

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      await updateUser({ name: form.name, phone: form.phone, agency: form.agency });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (!pwForm.currentPassword || !pwForm.newPassword) { setPwError('All fields are required.'); return; }
    if (pwForm.newPassword.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (pwForm.newPassword !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }
    setPwSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSaved(true);
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) { setPwError(err.message); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="profile-page">
      <div className="page-container profile-inner">
        <div className="profile-header">
          <div className="avatar" style={{width:64, height:64, fontSize:22, background: user.role === 'landlord' ? 'var(--green-light)' : 'var(--blue-light)', color: user.role === 'landlord' ? 'var(--green-dark)' : 'var(--blue)'}}>
            {user.avatar || user.name?.[0]}
          </div>
          <div>
            <h1 className="profile-name">{user.name}</h1>
            <div style={{display:'flex', gap:8, marginTop:6, alignItems:'center'}}>
              <span className={`badge badge-${user.role === 'landlord' ? 'green' : 'blue'}`}>{user.role}</span>
              <span className="text-muted text-small">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-left">
            {/* Account details */}
            <div className="card profile-card">
              <h2 className="profile-sec-title">Account details</h2>
              {saved  && <div className="alert alert-success">✓ Profile updated successfully!</div>}
              {error  && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSave} style={{display:'flex', flexDirection:'column', gap:14}}>
                <div className="input-group">
                  <label>Full name</label>
                  <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Email address <span className="text-muted text-small">(cannot be changed)</span></label>
                  <input className="input" value={user.email} disabled style={{opacity:0.6, cursor:'not-allowed'}} />
                </div>
                <div className="input-group">
                  <label>Phone number</label>
                  <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+61 4xx xxx xxx" />
                </div>
                {user.role === 'landlord' && (
                  <div className="input-group">
                    <label>Agency name</label>
                    <input className="input" value={form.agency} onChange={e => setForm({...form, agency: e.target.value})} placeholder="e.g. Ray White Kensington" />
                  </div>
                )}
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" />Saving…</> : 'Save changes'}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="card profile-card" style={{marginTop:20}}>
              <h2 className="profile-sec-title">Change password</h2>
              {pwSaved  && <div className="alert alert-success">✓ Password changed successfully!</div>}
              {pwError  && <div className="alert alert-error">{pwError}</div>}
              <form onSubmit={handlePasswordChange} style={{display:'flex', flexDirection:'column', gap:14}}>
                <div className="input-group">
                  <label>Current password</label>
                  <input className="input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} placeholder="Your current password" />
                </div>
                <div className="input-group">
                  <label>New password</label>
                  <input className="input" type="password" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} placeholder="Min. 6 characters" />
                </div>
                <div className="input-group">
                  <label>Confirm new password</label>
                  <input className="input" type="password" value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} placeholder="Repeat new password" />
                </div>
                <button type="submit" className="btn btn-outline" disabled={pwSaving}>
                  {pwSaving ? <><div className="spinner" />Updating…</> : 'Update password'}
                </button>
              </form>
            </div>
          </div>

          <div className="profile-right">
            <div className="card profile-card">
              <h2 className="profile-sec-title">Quick links</h2>
              <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:4}}>
                {user.role === 'tenant'   && <Link to="/dashboard" className="btn btn-outline w-full">My dashboard</Link>}
                {user.role === 'landlord' && <Link to="/landlord"  className="btn btn-outline w-full">Landlord portal</Link>}
                <Link to="/listings" className="btn btn-outline w-full">Browse listings</Link>
                <Link to="/guide"    className="btn btn-outline w-full">NSW renting guide</Link>
              </div>
            </div>

            <div className="card profile-card" style={{marginTop:16}}>
              <h2 className="profile-sec-title" style={{color:'var(--red)'}}>Danger zone</h2>
              <p className="text-muted text-small" style={{marginBottom:12}}>Log out of your account on this device.</p>
              <button className="btn btn-danger w-full" onClick={logout}>Log out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
