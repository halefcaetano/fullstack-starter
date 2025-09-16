import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await API.post('/auth/register', { username, email, password });
      localStorage.setItem('token', data.token);
      if (data?.user?.username) {
        localStorage.setItem('username', data.user.username); // ✅ Save username
      }
      navigate('/', { replace: true });
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Server error during registration');
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Register</h1>
      {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            className="w-full border rounded p-2"
            value={username}
            onChange={e=>setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full border rounded p-2"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className="w-full border rounded p-2"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
          />
        </div>
        <button className="w-full px-4 py-2 bg-gray-600 text-white rounded">
          Create account
        </button>
      </form>
      <div className="mt-3 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="underline">
          Login
        </Link>
      </div>
    </div>
  );
}
