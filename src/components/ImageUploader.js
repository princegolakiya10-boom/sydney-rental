import React, { useRef, useState, useCallback } from 'react';
import './ImageUploader.css';

const MAX_FILES  = 10;
const MAX_MB     = 5;
const MAX_BYTES  = MAX_MB * 1024 * 1024;
const ACCEPTED   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Convert a File to a base64 data URI
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result); // "data:image/jpeg;base64,..."
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });

// Resizes so the longest edge ≤ maxPx, then re-encodes as JPEG at given quality.
const resizeBase64 = (dataUri, maxPx = 1200, quality = 0.82) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const scale = Math.min(1, maxPx / Math.max(width, height));
      const w = Math.round(width  * scale);
      const h = Math.round(height * scale);
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUri;
  });

export default function ImageUploader({ images = [], onChange, maxFiles = MAX_FILES }) {
  const inputRef   = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [errors,   setErrors]   = useState([]);
  const [processing, setProcessing] = useState(false);

  const processFiles = useCallback(async (files) => {
    setErrors([]);
    const errs = [];
    const valid = [];

    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type)) {
        errs.push(`${file.name}: unsupported format (JPG, PNG, WEBP, GIF only)`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        errs.push(`${file.name}: exceeds ${MAX_MB} MB`);
        continue;
      }
      valid.push(file);
    }

    const remaining = maxFiles - images.length;
    if (valid.length > remaining) {
      errs.push(`Only ${remaining} more image${remaining === 1 ? '' : 's'} allowed (max ${maxFiles}).`);
      valid.splice(remaining);
    }

    if (errs.length) setErrors(errs);
    if (!valid.length) return;

    setProcessing(true);
    try {
      const converted = await Promise.all(
        valid.map(async (file) => {
          const b64 = await fileToBase64(file);
          return resizeBase64(b64); // resize to ≤1200px longest edge
        })
      );
      onChange([...images, ...converted]);
    } catch (err) {
      setErrors(prev => [...prev, err.message]);
    } finally {
      setProcessing(false);
    }
  }, [images, onChange, maxFiles]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleInput = (e) => processFiles(e.target.files);

  const removeImage = (idx) => {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
  };

  const moveLeft = (idx) => {
    if (idx === 0) return;
    const next = [...images];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveRight = (idx) => {
    if (idx === images.length - 1) return;
    const next = [...images];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  return (
    <div className="img-uploader">
      {/* Drop zone */}
      {images.length < maxFiles && (
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''} ${processing ? 'loading' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !processing && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            multiple
            style={{ display: 'none' }}
            onChange={handleInput}
          />
          {processing ? (
            <div className="dz-inner">
              <div className="spinner" />
              <span>Processing images…</span>
            </div>
          ) : (
            <div className="dz-inner">
              <div className="dz-icon">📷</div>
              <div className="dz-label">
                <strong>Click to upload</strong> or drag &amp; drop
              </div>
              <div className="dz-hint">JPG, PNG, WEBP up to {MAX_MB} MB each · max {maxFiles} photos</div>
            </div>
          )}
        </div>
      )}

      {/* Error messages */}
      {errors.map((err, i) => (
        <div key={i} className="alert alert-error" style={{ marginTop: 8, fontSize: 13 }}>{err}</div>
      ))}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="img-preview-grid">
          {images.map((src, idx) => (
            <div key={idx} className={`img-preview-item ${idx === 0 ? 'is-cover' : ''}`}>
              <img src={src} alt={`Upload ${idx + 1}`} />
              {idx === 0 && <div className="cover-badge">Cover</div>}
              <div className="img-actions">
                <button type="button" onClick={() => moveLeft(idx)}  disabled={idx === 0}              title="Move left">‹</button>
                <button type="button" onClick={() => moveRight(idx)} disabled={idx === images.length - 1} title="Move right">›</button>
                <button type="button" onClick={() => removeImage(idx)} className="remove-btn" title="Remove">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="img-count-hint">{images.length}/{maxFiles} photos · First image is the cover</p>
      )}
    </div>
  );
}
