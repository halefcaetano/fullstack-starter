// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

export default function Register({ onLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      await API.post('/auth/register', { username, email, password });
      const { data } = await API.post('/auth/login', { email, password });
      if (!data?.token) throw new Error('Registration succeeded, but login failed');
      onLogin?.(data.token, data.user);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message || 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Register</h1>
      <form onSubmit={handleSubmit} style={{ display:'grid', gap:12 }}>
        <label>Username
          <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required />
        </label>
        <label>Email
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={4} />
        </label>
        <button type="submit" disabled={loading}>{loading?'Creating…':'Create account'}</button>
        {err && <div style={{ color:'crimson' }}>{err}</div>}
      </form>
      <div style={{ marginTop:12, fontSize:14 }}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}
