import { useEffect, useState } from 'react'
import API from '../api'

export default function PostList({ refreshKey }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true); setError('')
      const { data } = await API.get('/posts')
      setPosts(data)
    } catch (err) {
      setError(err?.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [refreshKey])

  if (loading) return <div>Loading feed…</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!posts.length) return <div>No recipes yet.</div>

  return (
    <div className="w-full max-w-3xl space-y-3">
      {posts.map(p => (
        <div key={p._id} className="p-4 border rounded-2xl">
          <div className="text-sm text-neutral-500">{new Date(p.createdAt).toLocaleString()}</div>
          <h3 className="font-semibold text-lg">{p.title}</h3>
          <div className="text-sm text-neutral-700 mb-1">by {p.author?.username ?? 'Unknown'}</div>
          <p className="whitespace-pre-wrap">{p.content}</p>
          {!!(p.tags?.length) && (
            <div className="mt-2 text-sm text-neutral-600">Tags: {p.tags.join(', ')}</div>
          )}
        </div>
      ))}
    </div>
  )
}
