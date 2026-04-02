import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PropertyCard.css';

// Returns the src to use for a property image entry.
// Handles: base64 data URIs, full URLs, hex placeholder colours (legacy).
const imgSrc = (entry) => {
  if (!entry) return null;
  if (entry.startsWith('data:image/') || entry.startsWith('http')) return entry;
  return null; // hex colour — use as CSS background instead
};

const imgBg = (entry) => {
  if (!entry) return '#9FE1CB';
  if (entry.startsWith('#')) return entry;
  return '#f0f0ee'; // neutral while real image loads
};

export default function PropertyCard({ property }) {
  const { user, isSaved, toggleSaveProperty } = useAuth();
  const [saving, setSaving] = useState(false);
  const saved = isSaved(property._id);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || saving) return;
    setSaving(true);
    try { await toggleSaveProperty(property._id); }
    catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const firstImage  = property.images?.[0];
  const src         = imgSrc(firstImage);
  const bg          = imgBg(firstImage);
  const bedLabel    = property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`;

  return (
    <Link to={`/listing/${property._id}`} className="prop-card">
      <div className="prop-card-img" style={{ background: bg }}>
        {src && (
          <img
            src={src}
            alt={property.title}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            loading="lazy"
          />
        )}
        <div className="prop-card-badges">
          {property.billsIncluded && <span className="badge badge-blue">Bills incl.</span>}
          {property.furnished     && <span className="badge badge-amber">Furnished</span>}
        </div>
        {user && (
          <button
            className={`fav-btn ${saved ? 'saved' : ''}`}
            onClick={handleSave}
            disabled={saving}
            title={saved ? 'Remove from saved' : 'Save property'}
          >
            {saving ? '…' : (saved ? '♥' : '♡')}
          </button>
        )}
      </div>
      <div className="prop-card-body">
        <div className="prop-card-top">
          <span className="prop-price">${property.price?.toLocaleString()}<span className="price-unit">/wk</span></span>
          <span className="badge badge-gray">{property.type}</span>
        </div>
        <div className="prop-title">{property.title}</div>
        <div className="prop-address">📍 {property.address}</div>
        <div className="prop-meta">
          <span>🛏 {bedLabel}</span>
          <span>🚿 {property.bathrooms} bath</span>
          {property.area > 0 && <span>📐 {property.area}m²</span>}
        </div>
        {property.proximity?.[0] && (
          <div className="prop-prox">
            {property.proximity[0].type === 'uni' ? '🎓' : '🚌'}
            {' '}{property.proximity[0].name}
            <span className="prox-time">{property.proximity[0].time}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
