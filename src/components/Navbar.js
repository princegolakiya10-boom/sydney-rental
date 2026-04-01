import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (p) => location.pathname.startsWith(p) && p !== '/' ? true : location.pathname === p;

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner page-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-mark">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L1 5.5V13h4V8.5h4V13h4V5.5L7 1z" fill="white"/>
            </svg>
          </div>
          SydneyRent
        </Link>

        <div className="navbar-links hide-mobile">
          <Link to="/listings" className={`nav-link ${isActive('/listings') ? 'active' : ''}`}>Search</Link>
          <Link to="/map"      className={`nav-link ${isActive('/map')      ? 'active' : ''}`}>Map view</Link>
          <Link to="/guide"    className={`nav-link ${isActive('/guide')    ? 'active' : ''}`}>Renting guide</Link>
          {user?.role === 'landlord' && (
            <Link to="/landlord" className={`nav-link ${isActive('/landlord') ? 'active' : ''}`}>My portal</Link>
          )}
          {user?.role === 'tenant' && (
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
          )}
        </div>

        <div className="navbar-actions hide-mobile">
          {user ? (
            <div className="user-menu">
              <button className="user-trigger" onClick={() => setOpen(!open)}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--green-light)', color: 'var(--green-dark)' }}>
                  {user.avatar || user.name?.[0]}
                </div>
                <span>{user.name?.split(' ')[0]}</span>
                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
              </button>

              {open && (
                <>
                  <div className="dropdown">
                    <div className="dropdown-header">
                      <div className="avatar" style={{ width: 38, height: 38, fontSize: 14, background: 'var(--green-light)', color: 'var(--green-dark)' }}>
                        {user.avatar || user.name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                        <span className={`badge badge-${user.role === 'landlord' ? 'green' : 'blue'}`} style={{ marginTop: 3 }}>{user.role}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    {user.role === 'tenant' && (
                      <Link to="/dashboard" className="dropdown-item" onClick={() => setOpen(false)}>📊 Dashboard</Link>
                    )}
                    {user.role === 'landlord' && (
                      <Link to="/landlord" className="dropdown-item" onClick={() => setOpen(false)}>🏠 Landlord portal</Link>
                    )}
                    <Link to="/profile" className="dropdown-item" onClick={() => setOpen(false)}>👤 Profile</Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item text-red" onClick={handleLogout}>🚪 Log out</button>
                  </div>
                  <div className="dropdown-backdrop" onClick={() => setOpen(false)} />
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
