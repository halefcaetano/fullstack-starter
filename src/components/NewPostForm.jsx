import { useState } from 'react'
import API from '../api'

export default function NewPostForm({ onCreated }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const body = {
        title,
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      }
      await API.post('/posts', body)
      setTitle(''); setContent(''); setTags('')
      onCreated?.()
    } catch (err) {
      setError(err?.response?.data?.error || err.message)
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl p-4 border rounded-2xl space-y-3">
      <h3 className="font-semibold text-lg">Add a recipe</h3>
      <input
        className="w-full border rounded p-2"
        placeholder="Title"
        value={title}
        onChange={e=>setTitle(e.target.value)}
        required
      />
      <textarea
        className="w-full border rounded p-2"
        placeholder="Content (ingredients, steps, tips...)"
        rows={5}
        value={content}
        onChange={e=>setContent(e.target.value)}
        required
      />
      <input
        className="w-full border rounded p-2"
        placeholder="tags (comma separated)"
        value={tags}
        onChange={e=>setTags(e.target.value)}
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button className="px-4 py-2 rounded bg-black text-white">Publish</button>
    </form>
  )
}
