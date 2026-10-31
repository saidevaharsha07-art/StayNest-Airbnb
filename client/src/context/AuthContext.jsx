import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('staynest_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('staynest_token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('staynest_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('staynest_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('[Auth] Stored session invalid, resetting.');
          localStorage.removeItem('staynest_token');
          localStorage.removeItem('staynest_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    localStorage.setItem('staynest_token', receivedToken);
    localStorage.setItem('staynest_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = res.data;

    localStorage.setItem('staynest_token', receivedToken);
    localStorage.setItem('staynest_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('staynest_token');
    localStorage.removeItem('staynest_user');
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (updates) => {
    const res = await api.patch('/auth/profile', updates);
    setUser(res.data.user);
    localStorage.setItem('staynest_user', JSON.stringify(res.data.user));
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
