const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
const request = async (path, options = {}) => {
  const token = localStorage.getItem('sra_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

const get  = (path, options) => request(path, { method: 'GET',    ...options });
const post = (path, body)    => request(path, { method: 'POST',   body: JSON.stringify(body) });
const put  = (path, body)    => request(path, { method: 'PUT',    body: JSON.stringify(body) });
const del  = (path)          => request(path, { method: 'DELETE' });

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (body) => post('/auth/register', body),
  login:          (body) => post('/auth/login', body),
  getMe:          ()     => get('/auth/me'),
  updateMe:       (body) => put('/auth/me', body),
  changePassword: (body) => put('/auth/change-password', body),
};

// ─── Properties ───────────────────────────────────────────────────────────────
export const propertyAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    ).toString();
    return get(`/properties${qs ? '?' + qs : ''}`);
  },
  getOne:    (id)       => get(`/properties/${id}`),
  create:    (body)     => post('/properties', body),
  update:    (id, body) => put(`/properties/${id}`, body),
  remove:    (id)       => del(`/properties/${id}`),
  getMine:   ()         => get('/properties/landlord/mine'),
  getSaved:  ()         => get('/properties/saved'),
  toggleSave:(id)       => post(`/properties/${id}/save`, {}),

  // Upload/replace images for a property.
  // images = array of base64 data URIs: ["data:image/jpeg;base64,...", ...]
  updateImages: (id, images) => post(`/properties/${id}/images`, { images }),
};

// ─── Enquiries ────────────────────────────────────────────────────────────────
export const enquiryAPI = {
  send:           (body)        => post('/enquiries', body),
  getMine:        ()            => get('/enquiries/mine'),
  getLandlordAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v)
    ).toString();
    return get(`/enquiries/landlord${qs ? '?' + qs : ''}`);
  },
  getByProperty:  (propertyId) => get(`/enquiries/property/${propertyId}`),
  reply:          (id, body)   => put(`/enquiries/${id}/reply`, body),
  close:          (id)         => put(`/enquiries/${id}/close`, {}),
};
