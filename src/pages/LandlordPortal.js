import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyAPI, enquiryAPI } from '../api/client';
import PostListingModal from '../components/PostListingModal';
import './LandlordPortal.css';

export default function LandlordPortal() {
  const { user } = useAuth();

  const [tab,        setTab]        = useState('overview');
  const [properties, setProperties] = useState([]);
  const [enquiries,  setEnquiries]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [enqLoading, setEnqLoading] = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [replyTo,    setReplyTo]    = useState(null); // enquiry object
  const [replyText,  setReplyText]  = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error,      setError]      = useState('');

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await propertyAPI.getMine();
      setProperties(data.properties || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  const fetchEnquiries = useCallback(async () => {
    setEnqLoading(true);
    try {
      const data = await enquiryAPI.getLandlordAll();
      setEnquiries(data.enquiries || []);
    } catch (err) { setError(err.message); }
    finally { setEnqLoading(false); }
  }, []);

  useEffect(() => { fetchProperties(); fetchEnquiries(); }, [fetchProperties, fetchEnquiries]);

  // Toggle active/inactive
  const handleToggleStatus = async (property) => {
    const newStatus = property.status === 'active' ? 'inactive' : 'active';
    try {
      await propertyAPI.update(property._id, { status: newStatus });
      setProperties(prev => prev.map(p => p._id === property._id ? { ...p, status: newStatus } : p));
    } catch (err) { setError(err.message); }
  };

  // Delete
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await propertyAPI.remove(deleteId);
      setProperties(prev => prev.filter(p => p._id !== deleteId));
      setDeleteId(null);
    } catch (err) { setError(err.message); }
    finally { setDeleteLoading(false); }
  };

  // Reply to enquiry
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const data = await enquiryAPI.reply(replyTo._id, { reply: replyText });
      setEnquiries(prev => prev.map(en => en._id === replyTo._id ? data.enquiry : en));
      setReplyTo(null);
      setReplyText('');
    } catch (err) { setError(err.message); }
    finally { setReplyLoading(false); }
  };

  // Property created from modal
  const handleCreated = (newProperty) => {
    setProperties(prev => [newProperty, ...prev]);
    setTab('listings');
  };

  const pending  = enquiries.filter(e => e.status === 'pending');
  const totalViews = properties.reduce((s, p) => s + (p.views || 0), 0);

  if (!user || user.role !== 'landlord') return (
    <div className="page-container" style={{textAlign:'center', padding:'80px 24px'}}>
      <h2>Access restricted</h2>
      <p className="text-muted" style={{marginTop:8}}>This page is for landlords and agents only.</p>
      <Link to="/register" className="btn btn-primary" style={{marginTop:16}}>Sign up as landlord</Link>
    </div>
  );

  return (
    <div className="portal-page">
      {/* Sidebar */}
      <aside className="portal-sidebar">
        <div className="portal-profile">
          <div className="avatar" style={{width:46,height:46,fontSize:16,background:'var(--green-light)',color:'var(--green-dark)'}}>
            {user.avatar || user.name?.[0]}
          </div>
          <div>
            <div className="portal-name">{user.name}</div>
            {user.agency && <div className="portal-agency">{user.agency}</div>}
            <span className="badge badge-green" style={{marginTop:4}}>Landlord / Agent</span>
          </div>
        </div>

        <nav className="portal-nav">
          {[
            { key:'overview',  icon:'⊟', label:'Overview'    },
            { key:'listings',  icon:'🏠', label:'My listings', count: properties.length },
            { key:'enquiries', icon:'✉',  label:'Enquiries',   count: pending.length    },
          ].map(({ key, icon, label, count }) => (
            <button key={key} className={`portal-nav-item ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              <span className="pni-icon">{icon}</span> {label}
              {count > 0 && <span className="pni-badge">{count}</span>}
            </button>
          ))}
          <button className="portal-nav-item" onClick={() => setShowModal(true)}>
            <span className="pni-icon">+</span> Post new listing
          </button>
          <Link to="/profile" className="portal-nav-item">
            <span className="pni-icon">👤</span> Profile
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="portal-main">
        {error && <div className="alert alert-error" style={{marginBottom:16}}>{error}<button onClick={() => setError('')} style={{marginLeft:8, background:'none', border:'none', cursor:'pointer'}}>✕</button></div>}

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="animate-fade">
            <div className="portal-page-hd">
              <h1 className="portal-title">Dashboard</h1>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Post new listing</button>
            </div>
            <div className="stats-grid">
              {[
                [properties.length,  'Active listings'],
                [enquiries.length,    'Total enquiries'],
                [pending.length,      'Pending replies'],
                [totalViews,          'Total views'],
              ].map(([val, lbl]) => (
                <div key={lbl} className={`stat-card ${lbl === 'Pending replies' && val > 0 ? 'highlight' : ''}`}>
                  <div className="stat-card-num">{val}</div>
                  <div className="stat-card-lbl">{lbl}</div>
                </div>
              ))}
            </div>

            {pending.length > 0 && (
              <div className="overview-sec">
                <div className="overview-sec-hd">
                  <h2>Pending enquiries</h2>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab('enquiries')}>View all →</button>
                </div>
                {pending.slice(0,3).map(enq => (
                  <EnquiryCard key={enq._id} enq={enq} onReply={() => setReplyTo(enq)} compact />
                ))}
              </div>
            )}

            <div className="overview-sec">
              <div className="overview-sec-hd">
                <h2>Your listings</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setTab('listings')}>View all →</button>
              </div>
              {loading ? <div className="page-loader"><div className="spinner" /></div> :
               properties.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🏠</span>
                  <h3>No listings yet</h3>
                  <p>Post your first property to get started.</p>
                  <button className="btn btn-primary" style={{marginTop:12}} onClick={() => setShowModal(true)}>Post a listing</button>
                </div>
               ) : properties.slice(0,3).map(p => (
                <ListingRow key={p._id} property={p} onDelete={() => setDeleteId(p._id)} onToggle={() => handleToggleStatus(p)} />
               ))
              }
            </div>
          </div>
        )}

        {/* ── My Listings ── */}
        {tab === 'listings' && (
          <div className="animate-fade">
            <div className="portal-page-hd">
              <h1 className="portal-title">My listings</h1>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Post new listing</button>
            </div>
            {loading ? <div className="page-loader"><div className="spinner" /></div> :
             properties.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🏠</span>
                <h3>No listings yet</h3>
                <button className="btn btn-primary" style={{marginTop:12}} onClick={() => setShowModal(true)}>Post a listing</button>
              </div>
             ) : properties.map(p => (
              <ListingRow key={p._id} property={p} onDelete={() => setDeleteId(p._id)} onToggle={() => handleToggleStatus(p)} />
             ))
            }
          </div>
        )}

        {/* ── Enquiries ── */}
        {tab === 'enquiries' && (
          <div className="animate-fade">
            <div className="portal-page-hd">
              <h1 className="portal-title">Enquiries</h1>
              {pending.length > 0 && <span className="badge badge-amber">{pending.length} pending</span>}
            </div>
            {enqLoading ? <div className="page-loader"><div className="spinner" /></div> :
             enquiries.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✉️</span>
                <h3>No enquiries yet</h3>
                <p>When tenants message about your listings, they'll appear here.</p>
              </div>
             ) : enquiries.map(enq => (
              <EnquiryCard key={enq._id} enq={enq} onReply={() => setReplyTo(enq)} />
             ))
            }
          </div>
        )}
      </main>

      {/* Post listing modal */}
      {showModal && <PostListingModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      {/* Reply modal */}
      {replyTo && (
        <div className="modal-overlay" onClick={() => setReplyTo(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{marginBottom:6}}>Reply to enquiry</h2>
            <p className="text-muted text-small" style={{marginBottom:12}}>From: {replyTo.tenant?.name || 'Tenant'}</p>
            <div style={{background:'var(--gray-100)', borderRadius:'var(--radius)', padding:'12px 14px', marginBottom:14, fontSize:14, color:'var(--gray-600)', fontStyle:'italic'}}>
              "{replyTo.message}"
            </div>
            <form onSubmit={handleReply}>
              <div className="input-group">
                <label>Your reply</label>
                <textarea className="input" rows="4" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Hi! Thanks for your interest…" autoFocus />
              </div>
              <div style={{display:'flex', gap:10, marginTop:14}}>
                <button type="submit" className="btn btn-primary" disabled={replyLoading}>
                  {replyLoading ? <><div className="spinner" />Sending…</> : 'Send reply'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setReplyTo(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{maxWidth:380}} onClick={e => e.stopPropagation()}>
            <h2 style={{marginBottom:8}}>Delete listing?</h2>
            <p className="text-muted">This will permanently remove the listing and all its enquiries. This cannot be undone.</p>
            <div style={{display:'flex', gap:10, marginTop:20}}>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? <><div className="spinner" />Deleting…</> : 'Yes, delete'}
              </button>
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ListingRow({ property, onDelete, onToggle }) {
  return (
    <div className={`listing-row ${property.status === 'inactive' ? 'inactive' : ''}`}>
      <div className="lr-thumb" style={{background: property.images?.[0]?.startsWith('#') ? property.images[0] : '#9FE1CB'}} />
      <div className="lr-info">
        <div className="lr-title">{property.title}</div>
        <div className="lr-addr">{property.address}</div>
        <div className="lr-meta">
          <span>${property.price}/wk</span><span>·</span>
          <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`}</span><span>·</span>
          <span>{property.type}</span>
        </div>
      </div>
      <div className="lr-stats">
        <div><strong>{property.views||0}</strong><span>views</span></div>
        <div><strong>{property.enquiryCount||0}</strong><span>enquiries</span></div>
      </div>
      <div className="lr-actions">
        <span className={`badge badge-${property.status === 'active' ? 'green' : 'gray'}`}>{property.status}</span>
        <Link to={`/listing/${property._id}`} className="btn btn-ghost btn-sm">View</Link>
        <button className="btn btn-outline btn-sm" onClick={onToggle}>{property.status === 'active' ? 'Deactivate' : 'Activate'}</button>
        <button className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

function EnquiryCard({ enq, onReply, compact }) {
  const initials = enq.tenant?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '??';
  const propTitle = enq.property?.title || 'Property';
  return (
    <div className={`enquiry-card ${enq.status === 'replied' ? 'replied' : ''}`}>
      <div className="enq-head">
        <div className="avatar" style={{width:36,height:36,fontSize:13,background:'var(--blue-light)',color:'var(--blue)',flexShrink:0}}>{initials}</div>
        <div className="enq-meta">
          <span className="enq-name">{enq.tenant?.name || 'Tenant'}</span>
          <span className="enq-prop">re: {propTitle}</span>
        </div>
        <div style={{marginLeft:'auto', display:'flex', gap:8, alignItems:'center'}}>
          <span className="text-small text-muted">{new Date(enq.createdAt).toLocaleDateString('en-AU')}</span>
          <span className={`badge badge-${enq.status === 'pending' ? 'amber' : 'green'}`}>{enq.status}</span>
        </div>
      </div>
      <div className="enq-msg">"{enq.message}"</div>
      {enq.reply && <div className="enq-reply"><strong>Your reply:</strong> {enq.reply}</div>}
      {enq.status === 'pending' && (
        <button className={`btn btn-sm ${compact ? 'btn-outline' : 'btn-primary'}`} style={{marginTop:10}} onClick={onReply}>
          Reply{compact ? ' →' : ''}
        </button>
      )}
    </div>
  );
}
