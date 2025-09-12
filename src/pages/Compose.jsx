// src/pages/Compose.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Compose({ user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const authorDisplay = user?.username || user?.email || '';
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await API.post('/posts', { title, content }); navigate('/'); }
    catch (e2) { setErr(e2?.response?.data?.error || e2.message || 'Failed to create post'); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Write a Post</h1>
      <form onSubmit={handleSubmit} style={{ display:'grid', gap:12 }}>
        <label>Title
          <input type="text" value={title} onChange={e=>setTitle(e.target.value)} required />
        </label>
        <label>Content
          <textarea rows={8} value={content} onChange={e=>setContent(e.target.value)} required />
        </label>
        <label>Author
          <input type="text" value={authorDisplay} readOnly />
        </label>
        <button type="submit" disabled={loading}>{loading?'Posting…':'Publish'}</button>
        {err && <div style={{ color:'crimson' }}>{err}</div>}
      </form>
    </div>
  );
}
