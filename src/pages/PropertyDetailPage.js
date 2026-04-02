import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyAPI, enquiryAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './PropertyDetailPage.css';

// Resolve a raw image entry to a displayable src or null
const toSrc = (entry) => {
  if (!entry) return null;
  if (entry.startsWith('data:image/') || entry.startsWith('http')) return entry;
  return null;
};

const toBg = (entry) => {
  if (!entry) return '#9FE1CB';
  if (entry.startsWith('#')) return entry;
  return '#e8e8e5';
};

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const src = toSrc(images[idx]);
  const bg  = toBg(images[idx]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose}>✕</button>
        <button className="lb-prev"  onClick={prev}  disabled={images.length <= 1}>‹</button>
        <div className="lb-img-wrap" style={{ background: bg }}>
          {src
            ? <img src={src} alt={`Photo ${idx + 1}`} />
            : <div className="lb-placeholder">🏠</div>
          }
        </div>
        <button className="lb-next" onClick={next} disabled={images.length <= 1}>›</button>
        <div className="lb-counter">{idx + 1} / {images.length}</div>

        {/* Thumbnail strip */}
        <div className="lb-thumbs">
          {images.map((img, i) => {
            const ts = toSrc(img);
            const tb = toBg(img);
            return (
              <div
                key={i}
                className={`lb-thumb ${i === idx ? 'active' : ''}`}
                style={{ background: tb }}
                onClick={() => setIdx(i)}
              >
                {ts && <img src={ts} alt="" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSaved, toggleSaveProperty } = useAuth();

  const [property,        setProperty]        = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [saving,          setSaving]          = useState(false);
  const [lightboxIdx,     setLightboxIdx]     = useState(null); // null = closed

  const [enquiryMsg,      setEnquiryMsg]      = useState('');
  const [enquiryDone,     setEnquiryDone]     = useState(false);
  const [enquiryErr,      setEnquiryErr]      = useState('');
  const [enquirySending,  setEnquirySending]  = useState(false);

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
  if (error)   return (
    <div className="page-container" style={{padding:'60px 24px'}}>
      <div className="alert alert-error">{error}</div>
      <Link to="/listings" className="btn btn-outline" style={{marginTop:12}}>← Back to listings</Link>
    </div>
  );
  if (!property) return null;

  const images    = property.images || [];
  const saved     = isSaved(property._id);
  const bedLabel  = property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Bedrooms`;
  const landlord  = property.landlord || {};
  const available = property.available
    ? new Date(property.available).toLocaleDateString('en-AU', { day:'numeric', month:'long', year:'numeric' })
    : '—';

  // Build photo grid: main (index 0) + up to 3 side thumbs
  const mainImg  = images[0];
  const sideImgs = images.slice(1, 4);
  const hasMore  = images.length > 4;

  return (
    <div className="detail-page">
      {lightboxIdx !== null && (
        <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

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
        <div className="detail-main">

          {/* ── Photo grid ── */}
          <div className="detail-photos">
            {/* Main photo */}
            <div
              className="photo-main"
              style={{ background: toBg(mainImg) }}
              onClick={() => images.length > 0 && setLightboxIdx(0)}
            >
              {toSrc(mainImg) && (
                <img src={toSrc(mainImg)} alt={property.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
              )}
              {images.length === 0 && (
                <div className="photo-placeholder">🏠</div>
              )}
              {images.length > 0 && (
                <button className="view-all-btn" onClick={e => { e.stopPropagation(); setLightboxIdx(0); }}>
                  📷 View all {images.length} photos
                </button>
              )}
            </div>

            {/* Side thumbs */}
            {sideImgs.length > 0 && (
              <div className="photo-side">
                {sideImgs.map((img, i) => {
                  const realIdx = i + 1;
                  const isLast  = i === sideImgs.length - 1 && hasMore;
                  return (
                    <div
                      key={i}
                      className="photo-thumb"
                      style={{ background: toBg(img) }}
                      onClick={() => setLightboxIdx(realIdx)}
                    >
                      {toSrc(img) && <img src={toSrc(img)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />}
                      {isLast && (
                        <div className="photo-more">+{images.length - 4} more</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
              [property.area > 0 ? `${property.area}m²` : '—', 'floor area'],
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
                <div key={k} className="lease-row"><span>{k}</span><span>{v}</span></div>
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
                    <div className="prox-icon">{p.type==='uni'?'🎓':p.type==='transport'?'🚌':p.type==='shop'?'🛒':'📍'}</div>
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
            <div>
              <strong>NSW tenant rights tip:</strong> Bonds must be lodged with NSW Fair Trading within 10 days. You have the right to a condition report before moving in.{' '}
              <Link to="/guide" className="text-green">Read the guide →</Link>
            </div>
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
                  <textarea
                    className="input"
                    rows="4"
                    placeholder="Hi, I'm interested in this property. Could we arrange an inspection?"
                    value={enquiryMsg}
                    onChange={e => { setEnquiryMsg(e.target.value); setEnquiryErr(''); }}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full" style={{marginTop:10}} disabled={enquirySending}>
                  {enquirySending
                    ? <><div className="spinner" /> Sending…</>
                    : user ? '✉ Send enquiry' : '🔒 Log in to enquire'
                  }
                </button>
              </form>
            )}

            {(landlord.phone || landlord.email) && (
              <div style={{display:'flex', gap:8, marginTop:10}}>
                {landlord.phone && <a href={`tel:${landlord.phone}`}    className="btn btn-outline btn-sm" style={{flex:1,justifyContent:'center'}}>📞 Call</a>}
                {landlord.email && <a href={`mailto:${landlord.email}`} className="btn btn-outline btn-sm" style={{flex:1,justifyContent:'center'}}>✉ Email</a>}
              </div>
            )}
          </div>

          <div className="map-card card">
            <div className="map-mock">📍</div>
            <div style={{padding:'10px 14px',fontSize:13,color:'var(--gray-600)'}}>{property.suburb}, Sydney NSW</div>
          </div>

          <div className="card" style={{padding:'14px 16px'}}>
            {[
              ['👁 Views',     property.views || 0],
              ['✉ Enquiries', property.enquiryCount || 0],
              ['📅 Listed',   property.createdAt ? new Date(property.createdAt).toLocaleDateString('en-AU') : '—'],
            ].map(([k, v]) => (
              <div key={k} className="listing-stat"><span>{k}</span><strong>{v}</strong></div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
