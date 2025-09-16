// src/pages/MyRecipes.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyRecipes } from '../api';

export default function MyRecipes() {
  const [items, setItems] = useState([]);
  useEffect(() => { fetchMyRecipes().then(setItems).catch(console.error); }, []);
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <Link className="px-3 py-2 rounded bg-blue-600 text-white" to="/recipes/new">New Recipe</Link>
      </div>
      <ul className="space-y-3">
        {items.map(r => (
          <li key={r._id} className="border rounded p-3 flex items-center justify-between">
            <Link to={`/recipes/${r._id}`} className="font-semibold">{r.title}</Link>
            <div className="flex gap-2">
              <Link className="px-2 py-1 border rounded" to={`/recipes/${r._id}/edit`}>Edit</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
