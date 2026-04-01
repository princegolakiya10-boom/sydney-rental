import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, propertyAPI } from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while checking token on boot

  // On mount: if token exists, verify it with the API
  useEffect(() => {
    const token = localStorage.getItem('sra_token');
    if (!token) { setLoading(false); return; }

    authAPI.getMe()
      .then(data => setUser(data.user))
      .catch(() => localStorage.removeItem('sra_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password }); // throws on error
    localStorage.setItem('sra_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (fields) => {
    const data = await authAPI.register(fields); // throws on error
    localStorage.setItem('sra_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('sra_token');
    setUser(null);
  };

  const updateUser = async (fields) => {
    const data = await authAPI.updateMe(fields);
    setUser(data.user);
    return data.user;
  };

  const toggleSaveProperty = useCallback(async (propertyId) => {
    const data = await propertyAPI.toggleSave(propertyId);
    // API returns updated savedProperties array
    setUser(prev => ({ ...prev, savedProperties: data.savedProperties }));
    return data.saved;
  }, []);

  const isSaved = (propertyId) => {
    if (!user?.savedProperties) return false;
    return user.savedProperties.some(p =>
      (typeof p === 'object' ? p._id : p)?.toString() === propertyId?.toString()
    );
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, toggleSaveProperty, isSaved }}>
      {children}
    </AuthContext.Provider>
  );
};
