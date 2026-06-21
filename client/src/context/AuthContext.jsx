import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('vs_user')); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('vs_token') || null);

  const api = useCallback((method, path, data) =>
    axios({ method, url: `${API_BASE}${path}`, data, headers: token ? { Authorization: `Bearer ${token}` } : {} }),
    [token]);

  const persist = (u, t) => {
    setUser(u); setToken(t);
    localStorage.setItem('vs_user', JSON.stringify(u));
    localStorage.setItem('vs_token', t);
  };

  const identifyPendo = (u) => {
    window.pendo?.identify({
      visitor: {
        id: u.id,
        email: u.email,
        full_name: u.name,
        username: u.username,
        bio: u.bio,
        avatarInitial: u.avatarInitial,
        stampCount: u.stampCount,
        createdAt: u.createdAt
      }
    });
  };

  useEffect(() => {
    if (user) identifyPendo(user);
  }, []);

  const login = async (email, password) => {
    const r = await axios.post(`${API_BASE}/auth/login`, { email, password });
    persist(r.data.user, r.data.token);
    identifyPendo(r.data.user);
    return r.data.user;
  };
  const signup = async (name, email, password, username) => {
    const r = await axios.post(`${API_BASE}/auth/signup`, { name, email, password, username });
    persist(r.data.user, r.data.token);
    identifyPendo(r.data.user);
    return r.data.user;
  };
  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('vs_user'); localStorage.removeItem('vs_token');
    window.pendo.clearSession();
  };
  const updateProfile = async (data) => {
    const r = await api('put', '/user/profile', data);
    const updated = { ...user, ...r.data };
    setUser(updated); localStorage.setItem('vs_user', JSON.stringify(updated));
    return updated;
  };

  return <AuthCtx.Provider value={{ user, token, api, login, signup, logout, updateProfile }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
