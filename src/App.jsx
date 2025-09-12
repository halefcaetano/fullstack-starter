// src/App.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Compose from './pages/Compose.jsx';
import Register from './pages/Register.jsx';

function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const isAuthed = !!localStorage.getItem('token');
  const login = (token, userObj) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userObj || null));
    setUser(userObj || null);
  };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };
  return useMemo(() => ({ user, isAuthed, login, logout }), [user, isAuthed]);
}

function Navbar({ user, onLogout }) {
  return (
    <nav style={{padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #eee'}}>
      <Link to="/" style={{ textDecoration:'none', fontWeight:700 }}>My Blog</Link>
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        {user ? (
          <>
            <span style={{ fontSize:14, opacity:0.8 }}>{user.username || user.email}</span>
            <Link to="/compose">Compose</Link>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function PrivateRoute({ authed, children }) { return authed ? children : <Navigate to="/login" replace />; }

export default function App() {
  const auth = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem('token') && !auth.user) { auth.logout(); navigate('/login'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <Navbar user={auth.user} onLogout={() => { auth.logout(); navigate('/'); }} />
      <div style={{ maxWidth:720, margin:'24px auto', padding:'0 16px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={(t,u)=>{auth.login(t,u); navigate('/compose');}} />} />
          <Route path="/register" element={<Register onLogin={(t,u)=>{auth.login(t,u); navigate('/compose');}} />} />
          <Route path="/compose" element={<PrivateRoute authed={auth.isAuthed}><Compose user={auth.user} /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
