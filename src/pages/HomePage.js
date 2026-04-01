import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyAPI } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [search,   setSearch]   = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    propertyAPI.getAll({ limit: 3, sort: 'newest' })
      .then(data => setFeatured(data.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/listings${search ? '?search=' + encodeURIComponent(search) : ''}`);
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="page-container hero-content">
          <div className="hero-eyebrow">🇦🇺 Sydney's rental platform for newcomers</div>
          <h1 className="hero-title">Find your home<br/><em>in Sydney</em></h1>
          <p className="hero-desc">Tailored for international students and newcomers — search listings with filters built for you, with NSW tenant rights guidance included.</p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-input">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/><line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input placeholder="Search suburb, university, or address…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">Search</button>
          </form>

          <div className="hero-tags">
            {['Near UNSW','Under $450/wk','Furnished','Bills included','Near train'].map(tag => (
              <Link key={tag} to={`/listings?search=${encodeURIComponent(tag)}`} className="hero-tag">{tag}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="stats-strip">
        <div className="page-container stats-inner">
          {[['2,400+','Active listings'],['85+','Sydney suburbs'],['4','University filters'],['NSW','Tenant rights guide']].map(([n,l]) => (
            <React.Fragment key={l}>
              <div className="strip-stat"><span className="sn">{n}</span><span className="sl">{l}</span></div>
              <div className="strip-div" />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Featured listings */}
      <section className="home-section">
        <div className="page-container">
          <div className="home-sec-hd">
            <div>
              <h2 className="home-sec-title">Recent listings</h2>
              <p className="home-sec-sub">Fresh properties added to the platform</p>
            </div>
            <Link to="/listings" className="btn btn-outline">View all →</Link>
          </div>
          {loading ? (
            <div className="home-grid">
              {[1,2,3].map(i => <div key={i} className="card-skeleton" style={{height:280}} />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="home-grid">
              {featured.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
          ) : (
            <div style={{textAlign:'center', padding:'40px', color:'var(--gray-500)'}}>
              No listings yet. <Link to="/register" className="text-green">List a property →</Link>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="home-section how-section">
        <div className="page-container">
          <div style={{textAlign:'center', marginBottom:40}}>
            <h2 className="home-sec-title">How it works</h2>
            <p className="home-sec-sub">Three simple steps to find your Sydney home</p>
          </div>
          <div className="how-grid">
            {[
              ['🔍','1. Search & filter','Browse listings by suburb, price, bedrooms, or proximity to your university. Filter for furnished, bills included, pet-friendly, and more.'],
              ['❤️','2. Save favourites','Save properties you love to your dashboard. Compare them side-by-side and make informed decisions.'],
              ['✉️','3. Contact landlord','Send an enquiry directly to the landlord through the platform. Request inspections and ask questions easily.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="how-card card">
                <div className="how-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NSW Guide callout */}
      <section className="home-section">
        <div className="page-container">
          <div className="guide-callout">
            <div className="guide-callout-icon">📋</div>
            <div>
              <h3>NSW Renting guide</h3>
              <p>New to renting in Australia? Our plain-English guide covers tenant rights, bonds, lease terms, and what to check before signing anything.</p>
              <Link to="/guide" className="btn btn-primary" style={{marginTop:14}}>Read the guide →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Landlord CTA */}
      <section className="landlord-cta">
        <div className="page-container landlord-cta-inner">
          <div>
            <h2>Are you a landlord or agent?</h2>
            <p>List your properties and reach thousands of newcomers looking for a home in Sydney. Free to list, easy to manage.</p>
          </div>
          <div style={{display:'flex', gap:12, flexShrink:0}}>
            <Link to="/register" className="btn btn-primary btn-lg">List a property</Link>
            <Link to="/login" className="btn btn-lg" style={{background:'rgba(255,255,255,0.15)', color:'#fff', border:'1px solid rgba(255,255,255,0.4)'}}>Sign in</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="page-container footer-inner">
          <div className="footer-brand">
            <div className="logo-mark" style={{width:26,height:26,borderRadius:7}}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1L1 5.5V13h4V8.5h4V13h4V5.5L7 1z" fill="white"/></svg>
            </div>
            SydneyRent
          </div>
          <div className="footer-links">
            {[['Search','/listings'],['Map view','/map'],['Renting guide','/guide'],['List a property','/register']].map(([l,p]) => (
              <Link key={p} to={p}>{l}</Link>
            ))}
          </div>
          <div className="footer-copy">© 2026 SydneyRent — SDM404 Project</div>
        </div>
      </footer>
    </div>
  );
}
