import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyAPI, enquiryAPI } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import './TenantDashboard.css';

export default function TenantDashboard() {
  const { user } = useAuth();

  const [tab,        setTab]        = useState('saved');
  const [saved,      setSaved]      = useState([]);
  const [enquiries,  setEnquiries]  = useState([]);
  const [savLoading, setSavLoading] = useState(true);
  const [enqLoading, setEnqLoading] = useState(true);
  const [error,      setError]      = useState('');

  const fetchSaved = useCallback(async () => {
    setSavLoading(true);
    try {
      const data = await propertyAPI.getSaved();
      setSaved(data.properties || []);
    } catch (err) { setError(err.message); }
    finally { setSavLoading(false); }
  }, []);

  const fetchEnquiries = useCallback(async () => {
    setEnqLoading(true);
    try {
      const data = await enquiryAPI.getMine();
      setEnquiries(data.enquiries || []);
    } catch (err) { setError(err.message); }
    finally { setEnqLoading(false); }
  }, []);

  useEffect(() => { fetchSaved(); fetchEnquiries(); }, [fetchSaved, fetchEnquiries]);

  const replied = enquiries.filter(e => e.status === 'replied').length;

  if (!user || user.role !== 'tenant') return (
    <div className="page-container" style={{textAlign:'center', padding:'80px 24px'}}>
      <h2>Access restricted</h2>
      <p className="text-muted" style={{marginTop:8}}>Please log in as a tenant to view your dashboard.</p>
      <Link to="/login" className="btn btn-primary" style={{marginTop:16}}>Log in</Link>
    </div>
  );

  return (
    <div className="tenant-page">
      <div className="page-container tenant-inner">
        {/* Sidebar */}
        <aside className="tenant-sidebar">
          <div className="card tenant-profile-card">
            <div className="avatar" style={{width:56, height:56, fontSize:18, background:'var(--blue-light)', color:'var(--blue)', margin:'0 auto 12px'}}>
              {user.avatar || user.name?.[0]}
            </div>
            <div className="tp-name">{user.name}</div>
            <span className="badge badge-blue" style={{display:'flex', width:'fit-content', margin:'6px auto 0'}}>Tenant</span>
            <div className="tp-email">{user.email}</div>
            {user.phone && <div className="tp-phone">{user.phone}</div>}
            <div className="tp-since">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-AU', {month:'short', year:'numeric'}) : '—'}</div>
          </div>

          <div className="tenant-stats">
            <div className="ts-item">
              <span>❤️</span>
              <div><strong>{saved.length}</strong><span>Saved</span></div>
            </div>
            <div className="ts-item">
              <span>✉️</span>
              <div><strong>{enquiries.length}</strong><span>Enquiries</span></div>
            </div>
          </div>

          <nav className="tenant-nav">
            <button className={`tn-item ${tab === 'saved' ? 'active' : ''}`} onClick={() => setTab('saved')}>❤️ Saved properties</button>
            <button className={`tn-item ${tab === 'enquiries' ? 'active' : ''}`} onClick={() => setTab('enquiries')}>
              ✉️ My enquiries
              {replied > 0 && <span className="tn-badge">{replied}</span>}
            </button>
            <Link to="/listings" className="tn-item">🔍 Browse listings</Link>
            <Link to="/profile"  className="tn-item">👤 Edit profile</Link>
            <Link to="/guide"    className="tn-item">📋 Renting guide</Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="tenant-main">
          {error && <div className="alert alert-error" style={{marginBottom:16}}>{error}</div>}

          {/* Saved properties */}
          {tab === 'saved' && (
            <div className="animate-fade">
              <h1 className="tenant-page-title">Saved properties</h1>
              {savLoading ? (
                <div className="page-loader"><div className="spinner" /></div>
              ) : saved.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">❤️</span>
                  <h3>No saved properties yet</h3>
                  <p>Tap the heart icon on any listing to save it here.</p>
                  <Link to="/listings" className="btn btn-primary" style={{marginTop:14}}>Browse listings</Link>
                </div>
              ) : (
                <div className="tenant-grid">
                  {saved.map(p => <PropertyCard key={p._id} property={p} />)}
                </div>
              )}
            </div>
          )}

          {/* Enquiries */}
          {tab === 'enquiries' && (
            <div className="animate-fade">
              <h1 className="tenant-page-title">My enquiries</h1>
              {enqLoading ? (
                <div className="page-loader"><div className="spinner" /></div>
              ) : enquiries.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">✉️</span>
                  <h3>No enquiries sent yet</h3>
                  <p>When you message a landlord about a listing, it'll appear here.</p>
                  <Link to="/listings" className="btn btn-primary" style={{marginTop:14}}>Browse listings</Link>
                </div>
              ) : (
                <div className="tenq-list">
                  {enquiries.map(enq => {
                    const prop = enq.property;
                    return (
                      <div key={enq._id} className={`tenq-card card ${enq.status === 'replied' ? 'replied' : ''}`}>
                        <div className="tenq-head">
                          {prop && (
                            <div className="tenq-thumb" style={{background: prop.images?.[0]?.startsWith('#') ? prop.images[0] : '#9FE1CB'}} />
                          )}
                          <div className="tenq-info">
                            <div className="tenq-prop">
                              {prop ? <Link to={`/listing/${prop._id}`} className="text-green">{prop.title}</Link> : 'Property removed'}
                            </div>
                            {prop && <div className="tenq-addr">{prop.address}</div>}
                            <div className="tenq-date">{new Date(enq.createdAt).toLocaleDateString('en-AU')}</div>
                          </div>
                          <span className={`badge badge-${enq.status === 'pending' ? 'amber' : 'green'}`}>
                            {enq.status === 'pending' ? 'Awaiting reply' : 'Replied ✓'}
                          </span>
                        </div>
                        <div className="tenq-msg"><strong>Your message:</strong> {enq.message}</div>
                        {enq.reply && (
                          <div className="tenq-reply"><strong>Landlord's reply:</strong> {enq.reply}</div>
                        )}
                        {prop && (
                          <Link to={`/listing/${prop._id}`} className="btn btn-outline btn-sm" style={{marginTop:10}}>View listing →</Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
