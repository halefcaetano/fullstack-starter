import { useEffect, useState } from 'react';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', author: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadPosts() {
    setError('');
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load posts');
    }
  }

  useEffect(() => { loadPosts(); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const created = await res.json();
      if (!res.ok) throw new Error(created?.error || 'Failed to create');
      setForm({ title: '', content: '', author: '' });
      // Show the newly created post immediately
      setPosts(prev => [created, ...prev]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Blog</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
        <label>
          Title *
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </label>

        <label>
          Content *
          <textarea
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            required
            rows={5}
            style={{ width: '100%', padding: 8 }}
          />
        </label>

        <label>
          Author (optional)
          <input
            value={form.author}
            onChange={e => setForm({ ...form, author: e.target.value })}
            style={{ width: '100%', padding: 8 }}
          />
        </label>

        <button disabled={loading} type="submit">
          {loading ? 'Creating…' : 'Create Post'}
        </button>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
      </form>

      <section style={{ display: 'grid', gap: 12 }}>
        {posts.map(p => (
          <article key={p._id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            <h3 style={{ margin: 0 }}>{p.title}</h3>
            <small>
              {p.author || 'Anonymous'} · {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}
            </small>
            <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{p.content}</p>
          </article>
        ))}
        {!posts.length && <i>No posts yet.</i>}
      </section>
    </main>
  );
}
