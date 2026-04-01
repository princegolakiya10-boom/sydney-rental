# SydneyRent — React Frontend v2 (API Connected)

Full React frontend for the Sydney House Rental Application.  
**100% API-driven** — no mock data, no localStorage auth.  
All data comes from the Node.js + MongoDB backend.

SDM404 Assessment — Group 1

---

## Prerequisites

The **Node.js API** (`sydney-rental-api`) must be running first.  
See that project's README to start it on `http://localhost:5000`.

---

## Quick Start

```bash
cd sydney-rental-react
npm install
cp .env.example .env       # already set to http://localhost:5000/api
npm start                  # → http://localhost:3000
```

---

## Pages & Routes

| Route          | Access       | Description                              |
|----------------|--------------|------------------------------------------|
| `/`            | Public       | Home — hero search, live featured listings |
| `/listings`    | Public       | Search & filter all properties (live API) |
| `/listing/:id` | Public       | Property detail + enquiry form            |
| `/map`         | Public       | Map view of all live listings             |
| `/guide`       | Public       | NSW Renting Guide                         |
| `/login`       | Public       | Login → redirects by role                 |
| `/register`    | Public       | Register as Tenant or Landlord            |
| `/landlord`    | Landlord     | Portal — listings, enquiries, post listing|
| `/dashboard`   | Tenant       | Saved properties & sent enquiries         |
| `/profile`     | Any user     | Edit profile, change password, logout     |

---

## API Integration

All API calls go through `src/api/client.js`.  
The base URL is read from `REACT_APP_API_URL` in `.env`.

### Auth flow
1. User registers or logs in → API returns `{ token, user }`
2. Token stored in `localStorage` as `sra_token`
3. On app load, `AuthContext` calls `GET /api/auth/me` to verify token
4. All subsequent API calls include `Authorization: Bearer <token>`

### What's connected

| Feature                | API endpoint                      |
|------------------------|-----------------------------------|
| Register               | `POST /api/auth/register`         |
| Login                  | `POST /api/auth/login`            |
| Get current user       | `GET  /api/auth/me`               |
| Update profile         | `PUT  /api/auth/me`               |
| Change password        | `PUT  /api/auth/change-password`  |
| List/search properties | `GET  /api/properties`            |
| Get one property       | `GET  /api/properties/:id`        |
| Create listing         | `POST /api/properties`            |
| Update listing status  | `PUT  /api/properties/:id`        |
| Delete listing         | `DELETE /api/properties/:id`      |
| My listings (landlord) | `GET  /api/properties/landlord/mine` |
| Toggle save property   | `POST /api/properties/:id/save`   |
| Get saved properties   | `GET  /api/properties/saved`      |
| Send enquiry           | `POST /api/enquiries`             |
| My enquiries (tenant)  | `GET  /api/enquiries/mine`        |
| All enquiries (landlord)| `GET /api/enquiries/landlord`    |
| Reply to enquiry       | `PUT  /api/enquiries/:id/reply`   |

---

## Project Structure

```
src/
├── api/
│   └── client.js          ← All API calls in one place
├── context/
│   └── AuthContext.js     ← Token-based auth, no mock data
├── components/
│   ├── Navbar.js          ← Role-aware navigation
│   ├── PropertyCard.js    ← Uses MongoDB _id
│   ├── PostListingModal.js ← 3-step listing form → API
│   └── ProtectedRoute.js  ← Role-based route guard
├── pages/
│   ├── HomePage.js        ← Fetches real listings
│   ├── LoginPage.js       ← POST /api/auth/login
│   ├── RegisterPage.js    ← POST /api/auth/register
│   ├── ListingsPage.js    ← Live search + filter
│   ├── PropertyDetailPage.js ← Detail + enquiry form
│   ├── LandlordPortal.js  ← Full portal, all API
│   ├── TenantDashboard.js ← Saved + enquiries
│   ├── ProfilePage.js     ← Update + change password
│   ├── GuidePage.js       ← NSW Renting Guide
│   └── MapPage.js         ← Live map view
├── App.js                 ← All routes
└── index.css              ← Global design system
```
