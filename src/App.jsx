// src/App.jsx
import { useState } from 'react'
import { useAuth } from './auth'
import AuthForm from './components/AuthForm'
import NewPostForm from './components/NewPostForm'
import PostList from './components/PostList'
import './App.css'

function Nav() {
  const { user, logout } = useAuth()
  return (
    <div className="w-full flex items-center justify-between py-3">
      <div className="font-bold text-xl">Recipe Feed</div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm">Logged in as {user.username || user.email}</span>
            <button className="px-3 py-1 rounded border" onClick={logout}>Log out</button>
          </>
        ) : (
          <span className="text-sm text-neutral-600">Not logged in</span>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const bump = () => setRefreshKey(k => k + 1)

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4">
      <Nav />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {!user && <AuthForm />}
          {user && <NewPostForm onCreated={bump} />}
        </div>
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Homepage</h2>
          <PostList refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  )
}
