import React, { useState } from 'react';
import { propertyAPI } from '../api/client';
import ImageUploader from './ImageUploader';
import './PostListingModal.css';

const AMENITIES = ['Furnished','Air conditioning','Dishwasher','Washing machine','Parking','Balcony','Built-in wardrobes','Internet-ready','Lift access','Gym/pool','Intercom','Courtyard'];
const TYPES     = ['Apartment','House','Studio','Terrace','Townhouse','Room'];
const LEASES    = ['Fixed 12 months','Fixed 6 months','Month-to-month','Short stay'];
const PROX_DEF  = [{ name:'', time:'', type:'uni', score:80 }, { name:'', time:'', type:'transport', score:85 }];

const EMPTY = {
  title:'', address:'', suburb:'', type:'Apartment', price:'', bond:'',
  bedrooms:'1', bathrooms:'1', parking:'0', area:'',
  available:'', leaseType:'Fixed 12 months', description:'',
  features:[], pets:false, billsIncluded:false, furnished:false,
  images:[],
  proximity: PROX_DEF.map(p => ({...p})),
};

export default function PostListingModal({ onClose, onCreated }) {
  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState({ ...EMPTY, proximity: PROX_DEF.map(p => ({...p})) });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState('');

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleFeature = (feat) => {
    const next = form.features.includes(feat)
      ? form.features.filter(f => f !== feat)
      : [...form.features, feat];
    set('features', next);
    if (feat === 'Furnished') set('furnished', !form.furnished);
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.title.trim())   e.title   = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.suburb.trim())  e.suburb  = 'Required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter a valid amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.available)          e.available    = 'Required';
    if (!form.description.trim()) e.description  = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setApiErr('');
    try {
      const payload = {
        ...form,
        price:     Number(form.price),
        bond:      form.bond ? Number(form.bond) : Number(form.price) * 4,
        bedrooms:  Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        parking:   Number(form.parking) || 0,
        area:      Number(form.area) || 0,
        proximity: form.proximity.filter(p => p.name.trim()),
        // images is already the base64 array from ImageUploader
      };
      const data = await propertyAPI.create(payload);
      onCreated(data.property);
      onClose();
    } catch (err) {
      setApiErr(err.message);
      setLoading(false);
    }
  };

  const setProx = (i, field, value) => {
    const prox = form.proximity.map((p, idx) => idx === i ? { ...p, [field]: value } : p);
    set('proximity', prox);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="pm-header">
          <div>
            <h2>Post a listing</h2>
            <p className="text-muted text-small">Step {step} of 3</p>
          </div>
          <button className="pm-close" onClick={onClose}>✕</button>
        </div>

        <div className="pm-progress"><div className="pm-bar" style={{ width: (step/3*100)+'%' }} /></div>

        <div className="pm-steps">
          {['Property details', 'Listing info & photos', 'Review'].map((s, i) => (
            <div key={s} className={`pm-step ${step === i+1 ? 'active' : ''} ${step > i+1 ? 'done' : ''}`}>
              <div className="pm-step-dot">{step > i+1 ? '✓' : i+1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="pm-body">
          {apiErr && <div className="alert alert-error">{apiErr}</div>}

          {/* ── Step 1: Property details ── */}
          {step === 1 && (
            <div className="animate-fade">
              <div className="fg2">
                <div className="input-group" style={{gridColumn:'1/-1'}}>
                  <label>Listing title *</label>
                  <input className={`input ${errors.title?'error':''}`} placeholder="e.g. Modern 2-bedroom apartment in Kensington" value={form.title} onChange={e => set('title', e.target.value)} />
                  {errors.title && <span className="ferr">{errors.title}</span>}
                </div>
                <div className="input-group" style={{gridColumn:'1/-1'}}>
                  <label>Full address *</label>
                  <input className={`input ${errors.address?'error':''}`} placeholder="12 Anzac Parade, Kensington NSW 2033" value={form.address} onChange={e => set('address', e.target.value)} />
                  {errors.address && <span className="ferr">{errors.address}</span>}
                </div>
                <div className="input-group">
                  <label>Suburb *</label>
                  <input className={`input ${errors.suburb?'error':''}`} placeholder="e.g. Kensington" value={form.suburb} onChange={e => set('suburb', e.target.value)} />
                  {errors.suburb && <span className="ferr">{errors.suburb}</span>}
                </div>
                <div className="input-group">
                  <label>Property type</label>
                  <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Weekly rent (AUD) *</label>
                  <input className={`input ${errors.price?'error':''}`} type="number" placeholder="420" value={form.price} onChange={e => set('price', e.target.value)} />
                  {errors.price && <span className="ferr">{errors.price}</span>}
                </div>
                <div className="input-group">
                  <label>Bond <span className="text-muted text-small">(blank = 4 weeks)</span></label>
                  <input className="input" type="number" placeholder="Auto" value={form.bond} onChange={e => set('bond', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Bedrooms</label>
                  <select className="input" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
                    <option value="0">Studio</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Bathrooms</label>
                  <select className="input" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}>
                    {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Parking spaces</label>
                  <select className="input" value={form.parking} onChange={e => set('parking', e.target.value)}>
                    {[0,1,2].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Floor area (m²)</label>
                  <input className="input" type="number" placeholder="68" value={form.area} onChange={e => set('area', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Listing info + Photos ── */}
          {step === 2 && (
            <div className="animate-fade">
              <div className="fg2">
                <div className="input-group">
                  <label>Available from *</label>
                  <input className={`input ${errors.available?'error':''}`} type="date" value={form.available} onChange={e => set('available', e.target.value)} />
                  {errors.available && <span className="ferr">{errors.available}</span>}
                </div>
                <div className="input-group">
                  <label>Lease type</label>
                  <select className="input" value={form.leaseType} onChange={e => set('leaseType', e.target.value)}>
                    {LEASES.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{gridColumn:'1/-1'}}>
                  <label>Description *</label>
                  <textarea className={`input ${errors.description?'error':''}`} rows="4" placeholder="Describe the property — features, location, who it suits…" value={form.description} onChange={e => set('description', e.target.value)} />
                  {errors.description && <span className="ferr">{errors.description}</span>}
                </div>
              </div>

              <div className="pm-section-title">Amenities</div>
              <div className="amenity-grid">
                {AMENITIES.map(a => (
                  <label key={a} className={`amenity-chip ${form.features.includes(a)?'on':''}`}>
                    <input type="checkbox" checked={form.features.includes(a)} onChange={() => toggleFeature(a)} style={{display:'none'}} />
                    {form.features.includes(a) ? '✓ ' : ''}{a}
                  </label>
                ))}
              </div>

              <div className="pm-toggles">
                {[['pets','Pets allowed'], ['billsIncluded','Bills included in rent']].map(([f, lbl]) => (
                  <label key={f} className="pm-toggle">
                    <input type="checkbox" checked={form[f]} onChange={e => set(f, e.target.checked)} />
                    {lbl}
                  </label>
                ))}
              </div>

              {/* ── Photo upload ── */}
              <div className="pm-section-title" style={{marginTop:22}}>
                Property photos
                <span className="text-muted text-small" style={{fontWeight:400, marginLeft:8}}>optional · up to 10 images</span>
              </div>
              <ImageUploader
                images={form.images}
                onChange={(imgs) => set('images', imgs)}
              />

              <div className="pm-section-title" style={{marginTop:20}}>Nearby places <span className="text-muted text-small" style={{fontWeight:400}}>(optional)</span></div>
              {form.proximity.map((p, i) => (
                <div key={i} className="fg3" style={{marginBottom:10}}>
                  <div className="input-group">
                    <label>Place {i+1}</label>
                    <input className="input" placeholder="e.g. UNSW Sydney" value={p.name} onChange={e => setProx(i,'name',e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Travel time</label>
                    <input className="input" placeholder="8 min walk" value={p.time} onChange={e => setProx(i,'time',e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Type</label>
                    <select className="input" value={p.type} onChange={e => setProx(i,'type',e.target.value)}>
                      <option value="uni">University</option>
                      <option value="transport">Transport</option>
                      <option value="shop">Shopping</option>
                      <option value="health">Health</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div className="animate-fade">
              <div className="review-card">
                <h3>{form.title}</h3>
                <p className="text-muted text-small" style={{marginBottom:12}}>{form.address}</p>
                {[
                  ['Price',      `$${form.price}/week`],
                  ['Type',       form.type],
                  ['Beds/Baths', `${form.bedrooms === '0' ? 'Studio' : form.bedrooms + ' bed'} / ${form.bathrooms} bath`],
                  ['Lease',      form.leaseType],
                  ['Available',  form.available || '—'],
                  ['Bond',       `$${form.bond || Number(form.price)*4}`],
                  ['Pets',       form.pets ? 'Allowed' : 'Not permitted'],
                  ['Bills',      form.billsIncluded ? 'Included' : 'Separate'],
                  ['Features',   form.features.length ? form.features.join(', ') : '—'],
                  ['Photos',     form.images.length ? `${form.images.length} photo${form.images.length > 1 ? 's' : ''} uploaded` : 'No photos — listing will use a placeholder'],
                ].map(([k,v]) => (
                  <div key={k} className="review-row"><span>{k}</span><strong>{v}</strong></div>
                ))}
              </div>

              {/* Photo preview strip */}
              {form.images.length > 0 && (
                <div style={{marginTop:14}}>
                  <p className="text-muted text-small" style={{marginBottom:8}}>Photo preview:</p>
                  <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:4}}>
                    {form.images.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Preview ${i+1}`}
                        style={{width:80, height:60, objectFit:'cover', borderRadius:'var(--radius)', flexShrink:0, border: i === 0 ? '2px solid var(--green)' : '1px solid var(--gray-200)'}}
                      />
                    ))}
                  </div>
                </div>
              )}

              <p className="text-muted text-small" style={{marginTop:14}}>Your listing will go live immediately. You can edit photos anytime from your portal.</p>
            </div>
          )}
        </div>

        <div className="pm-footer">
          <button className="btn btn-outline" onClick={step === 1 ? onClose : () => setStep(s => s-1)}>
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          {step < 3
            ? <button className="btn btn-primary" onClick={next}>Continue →</button>
            : <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><div className="spinner" />Publishing…</> : '🚀 Publish listing'}
              </button>
          }
        </div>
      </div>
    </div>
  );
}
