// src/components/AuthForm.jsx
import { useState } from 'react'
import { useAuth } from '../auth'

export default function AuthForm() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register({ username: form.username, email: form.email, password: form.password })
      } else {
        await login({ email: form.email, password: form.password })
      }
      // optional: clear fields after success
      setForm({ username: '', email: '', password: '' })
    } catch (err) {
      setError(err?.response?.data?.error || 'Auth failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full p-4 border rounded-2xl">
      <div className="flex gap-2 mb-3">
        <button
          className={`px-3 py-1 rounded ${mode==='login' ? 'bg-black text-white' : 'border'}`}
          onClick={() => setMode('login')}
          type="button"
        >
          Login
        </button>
        <button
          className={`px-3 py-1 rounded ${mode==='register' ? 'bg-black text-white' : 'border'}`}
          onClick={() => setMode('register')}
          type="button"
        >
          Register
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {mode === 'register' && (
          <input
            name="username"
            placeholder="Username"
            className="w-full border rounded p-2"
            value={form.username}
            onChange={onChange}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border rounded p-2"
          value={form.email}
          onChange={onChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border rounded p-2"
          value={form.password}
          onChange={onChange}
          required
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          className="w-full py-2 rounded bg-black text-white disabled:opacity-60"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Submitting…' : (mode === 'register' ? 'Create account' : 'Log in')}
        </button>
      </form>
    </div>
  )
}
