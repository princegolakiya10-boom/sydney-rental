import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './MapPage.css';

// Fixed display positions for map pins (normalized 0-100 x,y)
const PIN_POSITIONS = {
  Kensington: { x:46, y:60 }, Chippendale: { x:62, y:40 }, Glebe: { x:36, y:36 },
  Redfern:    { x:66, y:52 }, Kingsford:   { x:42, y:66 }, 'Surry Hills': { x:70, y:44 },
  Newtown:    { x:40, y:52 }, Randwick:    { x:52, y:68 }, Ultimo: { x:56, y:40 }, Pyrmont: { x:48, y:34 },
};

export default function MapPage() {
  const { user, isSaved, toggleSaveProperty } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [filter,     setFilter]     = useState('');

  useEffect(() => {
    propertyAPI.getAll({ limit: 50 })
      .then(data => setProperties(data.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = properties.filter(p =>
    !filter ||
    p.suburb?.toLowerCase().includes(filter.toLowerCase()) ||
    p.title?.toLowerCase().includes(filter.toLowerCase())
  );

  const selectedProp = selected ? filtered.find(p => p._id === selected) : null;

  // Get pin position — use suburb mapping or fallback
  const getPos = (p) => {
    return PIN_POSITIONS[p.suburb] || { x: 40 + Math.random()*20, y: 40 + Math.random()*20 };
  };

  return (
    <div className="map-page">
      {/* Sidebar */}
      <div className="map-sidebar">
        <div className="map-sidebar-hd">
          <input className="input" placeholder="🔍 Filter by suburb or name…" value={filter} onChange={e => setFilter(e.target.value)} style={{marginBottom:0}} />
        </div>
        <div className="map-list-count">{filtered.length} {filtered.length === 1 ? 'property' : 'properties'}</div>
        <div className="map-list">
          {loading ? (
            [...Array(5)].map((_, i) => <div key={i} className="map-list-skeleton" />)
          ) : filtered.map(p => (
            <div key={p._id} className={`map-list-item ${selected === p._id ? 'active' : ''}`} onClick={() => setSelected(p._id)}>
              <div className="ml-thumb" style={{background: p.images?.[0]?.startsWith('#') ? p.images[0] : '#9FE1CB'}} />
              <div className="ml-info">
                <div className="ml-price">${p.price}/wk · {p.bedrooms === 0 ? 'Studio' : `${p.bedrooms} bed`}</div>
                <div className="ml-title">{p.title}</div>
                <div className="ml-addr">{p.suburb}</div>
                {p.proximity?.[0] && <div className="ml-prox">🎓 {p.proximity[0].name} — {p.proximity[0].time}</div>}
              </div>
              {user && (
                <button className={`ml-fav ${isSaved(p._id) ? 'saved' : ''}`} onClick={async e => { e.stopPropagation(); await toggleSaveProperty(p._id); }}>♥</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map area */}
      <div className="map-area">
        <svg viewBox="0 0 100 100" className="map-svg" preserveAspectRatio="xMidYMid meet">
          {/* Background */}
          <rect width="100" height="100" fill="#C8DDB5"/>
          {/* Roads */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="1.2" strokeOpacity="0.7"/>
          <line x1="0" y1="35" x2="100" y2="35" stroke="white" strokeWidth="0.7" strokeOpacity="0.5"/>
          <line x1="0" y1="65" x2="100" y2="65" stroke="white" strokeWidth="0.6" strokeOpacity="0.4"/>
          <line x1="55" y1="0" x2="55" y2="100" stroke="white" strokeWidth="1"   strokeOpacity="0.6"/>
          <line x1="30" y1="0" x2="30" y2="100" stroke="white" strokeWidth="0.7" strokeOpacity="0.4"/>
          <line x1="75" y1="0" x2="75" y2="100" stroke="white" strokeWidth="0.6" strokeOpacity="0.4"/>
          {/* University zones */}
          <circle cx="46" cy="62" r="10" fill="rgba(29,158,117,0.12)" stroke="rgba(29,158,117,0.5)" strokeWidth="0.4" strokeDasharray="1 1"/>
          <text x="46" y="73.5" textAnchor="middle" fontSize="2.4" fill="#0F6E56" fontWeight="600">UNSW</text>
          <circle cx="60" cy="38" r="9" fill="rgba(24,95,165,0.1)" stroke="rgba(24,95,165,0.4)" strokeWidth="0.4" strokeDasharray="1 1"/>
          <text x="60" y="48.5" textAnchor="middle" fontSize="2.4" fill="#185FA5" fontWeight="600">USyd</text>
          {/* Property pins */}
          {filtered.map(p => {
            const pos = getPos(p);
            const active = selected === p._id;
            return (
              <g key={p._id} onClick={() => setSelected(p._id)} style={{cursor:'pointer'}}>
                <rect x={pos.x-7} y={pos.y-5.5} width="14" height="8" rx="3" fill={active ? '#0F6E56' : '#1D9E75'} stroke={active ? '#fff' : 'none'} strokeWidth="0.5"/>
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontSize="2.5" fill="white" fontWeight="600">${p.price}</text>
                <polygon points={`${pos.x-2},${pos.y+2.5} ${pos.x+2},${pos.y+2.5} ${pos.x},${pos.y+5.5}`} fill={active ? '#0F6E56' : '#1D9E75'}/>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="map-legend">
          <div className="legend-row"><div className="legend-dot green" /> Listed property</div>
          <div className="legend-row"><div className="legend-circle" /> University zone (2km)</div>
        </div>

        {/* Popup */}
        {selectedProp && (
          <div className="map-popup card">
            <button className="popup-close" onClick={() => setSelected(null)}>✕</button>
            <div className="popup-img" style={{background: selectedProp.images?.[0]?.startsWith('#') ? selectedProp.images[0] : '#9FE1CB'}} />
            <div className="popup-body">
              <div className="popup-price">${selectedProp.price}<span>/wk</span></div>
              <div className="popup-title">{selectedProp.title}</div>
              <div className="popup-addr">{selectedProp.address}</div>
              <div className="popup-meta">
                <span>{selectedProp.bedrooms === 0 ? 'Studio' : `${selectedProp.bedrooms} bed`}</span>
                <span>·</span><span>{selectedProp.bathrooms} bath</span>
                {selectedProp.area > 0 && <><span>·</span><span>{selectedProp.area}m²</span></>}
              </div>
              <div style={{display:'flex', gap:8, marginTop:10}}>
                <Link to={`/listing/${selectedProp._id}`} className="btn btn-primary btn-sm" style={{flex:1, justifyContent:'center'}}>View listing →</Link>
                {user && (
                  <button className={`btn btn-sm ${isSaved(selectedProp._id) ? 'btn-primary' : 'btn-outline'}`} onClick={() => toggleSaveProperty(selectedProp._id)}>
                    {isSaved(selectedProp._id) ? '♥' : '♡'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
