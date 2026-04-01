import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import HomePage            from './pages/HomePage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import ListingsPage        from './pages/ListingsPage';
import PropertyDetailPage  from './pages/PropertyDetailPage';
import LandlordPortal      from './pages/LandlordPortal';
import TenantDashboard     from './pages/TenantDashboard';
import ProfilePage         from './pages/ProfilePage';
import GuidePage           from './pages/GuidePage';
import MapPage             from './pages/MapPage';

// Auth pages have their own full-page layout (no navbar)
function AuthLayout({ children }) { return children; }

// All other pages share the navbar
function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Auth (no navbar) ── */}
          <Route path="/login"    element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

          {/* ── Public (with navbar) ── */}
          <Route path="/"          element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/listings"  element={<MainLayout><ListingsPage /></MainLayout>} />
          <Route path="/listing/:id" element={<MainLayout><PropertyDetailPage /></MainLayout>} />
          <Route path="/guide"     element={<MainLayout><GuidePage /></MainLayout>} />
          <Route path="/map"       element={<MainLayout><MapPage /></MainLayout>} />

          {/* ── Landlord only ── */}
          <Route path="/landlord" element={
            <MainLayout>
              <ProtectedRoute role="landlord">
                <LandlordPortal />
              </ProtectedRoute>
            </MainLayout>
          } />

          {/* ── Tenant only ── */}
          <Route path="/dashboard" element={
            <MainLayout>
              <ProtectedRoute role="tenant">
                <TenantDashboard />
              </ProtectedRoute>
            </MainLayout>
          } />

          {/* ── Any logged-in user ── */}
          <Route path="/profile" element={
            <MainLayout>
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            </MainLayout>
          } />

          {/* ── 404 ── */}
          <Route path="*" element={
            <MainLayout>
              <div style={{ textAlign:'center', padding:'100px 24px' }}>
                <div style={{ fontSize:72, color:'var(--gray-200)', fontWeight:700 }}>404</div>
                <h2 style={{ marginBottom:12, color:'var(--gray-700)' }}>Page not found</h2>
                <a href="/" className="btn btn-primary">Back to home</a>
              </div>
            </MainLayout>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
