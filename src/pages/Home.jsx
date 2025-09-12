// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [err, setErr] = useState('');
  const isAuthed = !!localStorage.getItem('token');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await API.get('/posts');
        if (alive) setPosts(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message || 'Failed to load posts');
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Latest Posts</h1>
      {!isAuthed && <div style={{ margin:'8px 0 16px', fontSize:14 }}>
        New here? <Link to="/register">Create an account</Link> to start posting.
      </div>}
      {err && <div style={{ color:'crimson', marginBottom:12 }}>{err}</div>}
      {posts.length === 0 ? (
        <div>No posts yet.</div>
      ) : (
        <ul style={{ listStyle:'none', padding:0, display:'grid', gap:16 }}>
          {posts.map(p => (
            <li key={p._id} style={{ border:'1px solid #eee', borderRadius:8, padding:16 }}>
              <h2 style={{ margin:'0 0 8px 0' }}>{p.title}</h2>
              <div style={{ fontSize:14, opacity:0.8, marginBottom:8 }}>
                by {p.author?.username || p.author?.email || 'Anonymous'} {' · '}
                {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}
              </div>
              <p style={{ whiteSpace:'pre-wrap', margin:0 }}>{p.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
