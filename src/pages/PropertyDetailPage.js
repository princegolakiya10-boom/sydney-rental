import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyAPI, enquiryAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './PropertyDetailPage.css';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSaved, toggleSaveProperty } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [saving,   setSaving]   = useState(false);

  const [enquiryMsg,  setEnquiryMsg]  = useState('');
  const [enquiryDone, setEnquiryDone] = useState(false);
  const [enquiryErr,  setEnquiryErr]  = useState('');
  const [enquirySending, setEnquirySending] = useState(false);

  useEffect(() => {
    setLoading(true);
    propertyAPI.getOne(id)
      .then(data => setProperty(data.property))
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!user) { navigate('/login', { state: { from: `/listing/${id}` } }); return; }
    setSaving(true);
    try { await toggleSaveProperty(id); }
    finally { setSaving(false); }
  };

  const handleEnquiry = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login', { state: { from: `/listing/${id}` } }); return; }
    if (!enquiryMsg.trim()) { setEnquiryErr('Please write a message.'); return; }
    setEnquirySending(true);
    setEnquiryErr('');
    try {
      await enquiryAPI.send({ propertyId: id, message: enquiryMsg });
      setEnquiryDone(true);
      setEnquiryMsg('');
    } catch (err) {
      setEnquiryErr(err.message);
    } finally {
      setEnquirySending(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" style={{width:36,height:36}} /></div>;
  if (error)   return <div className="page-container" style={{padding:'60px 24px'}}><div className="alert alert-error">{error}</div><Link to="/listings" className="btn btn-outline" style={{marginTop:12}}>← Back to listings</Link></div>;
  if (!property) return null;

  const saved     = isSaved(property._id);
  const bedLabel  = property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Bedrooms`;
  const landlord  = property.landlord || {};
  const available = property.available ? new Date(property.available).toLocaleDateString('en-AU', { day:'numeric', month:'long', year:'numeric' }) : '—';

  return (
    <div className="detail-page">
      <div className="detail-breadcrumb">
        <div className="page-container breadcrumb-inner">
          <Link to="/listings" className="bc-link">← All listings</Link>
          <span className="bc-sep">/</span>
          <span>{property.suburb}</span>
          <span className="bc-sep">/</span>
          <span className="bc-current">{property.title}</span>
        </div>
      </div>

      <div className="page-container detail-body">
        {/* ── Left ── */}
        <div className="detail-main">
          {/* Photo grid */}
          <div className="detail-photos">
            <div className="photo-main" style={{ background: property.images?.[0]?.startsWith('#') ? property.images[0] : '#9FE1CB' }}>
              {property.images?.[0] && !property.images[0].startsWith('#') && (
                <img src={property.images[0]} alt={property.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
              )}
            </div>
            <div className="photo-side">
              {[1,2].map(i => (
                <div key={i} className="photo-thumb" style={{ background: property.images?.[i]?.startsWith('#') ? property.images[i] : '#C0DD97' }}>
                  {property.images?.[i] && !property.images[i].startsWith('#') && (
                    <img src={property.images[i]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  )}
                  {i === 2 && property.images?.length > 3 && (
                    <div className="photo-more">+{property.images.length - 3} more</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Title row */}
          <div className="detail-title-row">
            <div>
              <h1 className="detail-title">{property.title}</h1>
              <p className="detail-address">📍 {property.address}</p>
            </div>
            <button className={`btn ${saved ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={handleSave} disabled={saving}>
              {saving ? '…' : saved ? '♥ Saved' : '♡ Save'}
            </button>
          </div>

          {/* Stats */}
          <div className="detail-stats">
            {[
              [`$${property.price?.toLocaleString()}`, 'per week'],
              [bedLabel, 'bedrooms'],
              [property.bathrooms, 'bathrooms'],
              [`${property.area}m²`, 'floor area'],
              [property.type, 'type'],
            ].map(([val, lbl]) => (
              <div key={lbl} className="dstat">
                <div className="dstat-val">{val}</div>
                <div className="dstat-lbl">{lbl}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="detail-badges">
            {property.furnished     && <span className="badge badge-amber">Furnished</span>}
            {property.billsIncluded && <span className="badge badge-blue">Bills included</span>}
            {property.pets          && <span className="badge badge-green">Pets allowed</span>}
            <span className="badge badge-gray">Available {available}</span>
            <span className="badge badge-gray">{property.leaseType}</span>
          </div>

          <hr className="divider" />

          {/* Description */}
          <section className="detail-section">
            <h2 className="detail-sec-title">About this property</h2>
            <p style={{color:'var(--gray-600)', lineHeight:1.8}}>{property.description}</p>
          </section>

          {/* Features */}
          {property.features?.length > 0 && (
            <section className="detail-section">
              <h2 className="detail-sec-title">Features &amp; amenities</h2>
              <div className="features-grid">
                {property.features.map(f => (
                  <div key={f} className="feature-item">
                    <span className="feature-check">✓</span> {f}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Lease terms */}
          <section className="detail-section">
            <h2 className="detail-sec-title">Lease terms</h2>
            <div className="lease-table">
              {[
                ['Weekly rent',    `$${property.price?.toLocaleString()}`],
                ['Bond',          `$${property.bond?.toLocaleString()} (held by NSW Fair Trading)`],
                ['Lease type',     property.leaseType],
                ['Available from', available],
                ['Pets',           property.pets ? 'Allowed' : 'Not permitted'],
                ['Bills',          property.billsIncluded ? 'Included in rent' : 'Tenant pays usage'],
              ].map(([k, v]) => (
                <div key={k} className="lease-row">
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Proximity */}
          {property.proximity?.length > 0 && (
            <section className="detail-section">
              <h2 className="detail-sec-title">Nearby</h2>
              <div className="prox-list">
                {property.proximity.map((p, i) => (
                  <div key={i} className="prox-row">
                    <div className="prox-icon">{p.type === 'uni' ? '🎓' : p.type === 'transport' ? '🚌' : p.type === 'shop' ? '🛒' : '📍'}</div>
                    <div className="prox-info">
                      <div className="prox-name">{p.name}</div>
                      <div className="prox-bar-wrap">
                        <div className="prox-bar"><div className="prox-fill" style={{width:(p.score||70)+'%'}} /></div>
                        <span className="prox-time">{p.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="nsw-tip">
            <span>📋</span>
            <div><strong>NSW tenant rights tip:</strong> Bonds must be lodged with NSW Fair Trading within 10 days. You have the right to a condition report before moving in. <Link to="/guide" className="text-green">Read the guide →</Link></div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="detail-sidebar">
          <div className="agent-card card">
            <div className="agent-head">
              <div className="avatar" style={{width:44,height:44,fontSize:15,background:'var(--green-light)',color:'var(--green-dark)'}}>
                {landlord.avatar || landlord.name?.[0] || '?'}
              </div>
              <div>
                <div style={{fontWeight:600,fontSize:15}}>{landlord.name}</div>
                {landlord.agency && <div style={{fontSize:12,color:'var(--gray-500)'}}>{landlord.agency}</div>}
                <span className="badge badge-green" style={{marginTop:4}}>Landlord / Agent</span>
              </div>
            </div>

            {enquiryDone ? (
              <div className="alert alert-success" style={{marginTop:16}}>✓ Enquiry sent! The landlord will be in touch.</div>
            ) : (
              <form onSubmit={handleEnquiry} style={{marginTop:16}}>
                {enquiryErr && <div className="alert alert-error">{enquiryErr}</div>}
                <div className="input-group">
                  <label style={{fontSize:13}}>Your message</label>
                  <textarea className="input" rows="4" placeholder={`Hi, I'm interested in this property. Could we arrange an inspection?`} value={enquiryMsg} onChange={e => { setEnquiryMsg(e.target.value); setEnquiryErr(''); }} />
                </div>
                <button type="submit" className="btn btn-primary w-full" style={{marginTop:10}} disabled={enquirySending}>
                  {enquirySending ? <><div className="spinner" /> Sending…</> : user ? '✉ Send enquiry' : '🔒 Log in to enquire'}
                </button>
              </form>
            )}

            {landlord.phone && (
              <div style={{display:'flex',gap:8,marginTop:10}}>
                <a href={`tel:${landlord.phone}`}  className="btn btn-outline btn-sm" style={{flex:1,justifyContent:'center'}}>📞 Call</a>
                <a href={`mailto:${landlord.email}`} className="btn btn-outline btn-sm" style={{flex:1,justifyContent:'center'}}>✉ Email</a>
              </div>
            )}
          </div>

          <div className="map-card card">
            <div className="map-mock">📍</div>
            <div style={{padding:'10px 14px',fontSize:13,color:'var(--gray-600)'}}>{property.suburb}, Sydney NSW</div>
          </div>

          <div className="card" style={{padding:'14px 16px'}}>
            {[['👁 Views', property.views||0], ['✉ Enquiries', property.enquiryCount||0], ['📅 Listed', property.createdAt ? new Date(property.createdAt).toLocaleDateString('en-AU') : '—']].map(([k,v]) => (
              <div key={k} className="listing-stat"><span>{k}</span><strong>{v}</strong></div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
