// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('halef.caetano@hotmail.com');
  const [password, setPassword] = useState('haleff');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (!data?.token) throw new Error('Missing token on response');
      onLogin?.(data.token, data.user);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Login</h1>
      <form onSubmit={handleSubmit} style={{ display:'grid', gap:12 }}>
        <label>Email
          <input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </label>
        <label>Password
          <input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading}>{loading?'Signing in…':'Sign in'}</button>
        {err && <div style={{ color:'crimson' }}>{err}</div>}
      </form>
      <div style={{ marginTop:12, fontSize:14 }}>
        Don’t have an account? <Link to="/register">Register</Link>
      </div>
    </div>
  );
}
