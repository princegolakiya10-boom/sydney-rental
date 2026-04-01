import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyAPI } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import './ListingsPage.css';

const SUBURBS = ['Kensington','Chippendale','Glebe','Redfern','Kingsford','Surry Hills','Newtown','Randwick','Ultimo','Pyrmont'];
const TYPES   = ['Apartment','House','Studio','Terrace','Townhouse','Room'];

export default function ListingsPage() {
  const [searchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  const [search,       setSearch]       = useState(searchParams.get('search') || '');
  const [suburb,       setSuburb]       = useState('');
  const [type,         setType]         = useState('');
  const [bedrooms,     setBedrooms]     = useState('');
  const [maxPrice,     setMaxPrice]     = useState('');
  const [furnished,    setFurnished]    = useState(false);
  const [billsInc,     setBillsInc]     = useState(false);
  const [pets,         setPets]         = useState(false);
  const [sort,         setSort]         = useState('newest');
  const [moreFilters,  setMoreFilters]  = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { search, suburb, type, bedrooms, maxPrice, sort };
      if (furnished) params.furnished    = true;
      if (billsInc)  params.billsIncluded = true;
      if (pets)      params.pets         = true;
      const data = await propertyAPI.getAll(params);
      setProperties(data.properties || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, suburb, type, bedrooms, maxPrice, furnished, billsInc, pets, sort]);

  useEffect(() => {
    const t = setTimeout(fetchProperties, 350); // debounce search input
    return () => clearTimeout(t);
  }, [fetchProperties]);

  const clearFilters = () => {
    setSuburb(''); setType(''); setBedrooms(''); setMaxPrice('');
    setFurnished(false); setBillsInc(false); setPets(false); setSearch('');
  };

  const activeCount = [suburb, type, bedrooms, maxPrice, furnished, billsInc, pets].filter(Boolean).length;

  return (
    <div className="listings-page">
      {/* Search bar */}
      <div className="listings-bar">
        <div className="page-container listings-bar-inner">
          <div className="search-wrap">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/><line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suburb, address, university…" />
            {search && <button className="clear-x" onClick={() => setSearch('')}>×</button>}
          </div>

          <div className="filter-row">
            <select className="input fsel" value={suburb}   onChange={e => setSuburb(e.target.value)}>
              <option value="">All suburbs</option>
              {SUBURBS.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="input fsel" value={bedrooms} onChange={e => setBedrooms(e.target.value)}>
              <option value="">Any beds</option>
              <option value="0">Studio</option>
              <option value="1">1 bed</option>
              <option value="2">2 bed</option>
              <option value="3+">3+ bed</option>
            </select>
            <select className="input fsel" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}>
              <option value="">Any price</option>
              <option value="350">Under $350/wk</option>
              <option value="450">Under $450/wk</option>
              <option value="550">Under $550/wk</option>
              <option value="700">Under $700/wk</option>
            </select>
            <button className={`btn btn-outline btn-sm ${moreFilters ? 'active-filter' : ''}`} onClick={() => setMoreFilters(v => !v)}>
              ⚙ Filters {activeCount > 0 && <span className="fcount">{activeCount}</span>}
            </button>
          </div>
        </div>

        {moreFilters && (
          <div className="extra-filters">
            <div className="page-container" style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
              <select className="input fsel" value={type} onChange={e => setType(e.target.value)}>
                <option value="">All types</option>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              {[['furnished', furnished, setFurnished, 'Furnished'],
                ['billsInc',  billsInc,  setBillsInc,  'Bills included'],
                ['pets',      pets,      setPets,      'Pets allowed']].map(([key, val, setter, label]) => (
                <label key={key} className={`ftoggle ${val ? 'on' : ''}`}>
                  <input type="checkbox" checked={val} onChange={e => setter(e.target.checked)} style={{display:'none'}} />
                  {label}
                </label>
              ))}
              {activeCount > 0 && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear all</button>}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="page-container listings-body">
        <div className="results-header">
          <span className="results-count">
            {loading ? 'Loading…' : `${total} ${total === 1 ? 'property' : 'properties'} found`}
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span className="text-muted text-small">Sort:</span>
            <select className="input fsel" value={sort} onChange={e => setSort(e.target.value)} style={{width:'auto'}}>
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="listings-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="card-skeleton" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🏠</span>
            <h3>No properties found</h3>
            <p>Try adjusting your search or filters.</p>
            <button className="btn btn-outline" onClick={clearFilters} style={{marginTop:16}}>Clear all filters</button>
          </div>
        ) : (
          <div className="listings-grid">
            {properties.map(p => <PropertyCard key={p._id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
