// src/pages/Recipes.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRecipes } from '../api';

export default function Recipes() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchRecipes().then(setItems).catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <Link className="px-3 py-2 rounded bg-blue-600 text-white" to="/recipes/new">New Recipe</Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map(r => (
          <Link key={r._id} to={`/recipes/${r._id}`} className="border rounded-lg overflow-hidden hover:shadow">
            {r.imageUrl ? (
              <img src={r.imageUrl} alt={r.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">No Image</div>
            )}
            <div className="p-3">
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-gray-500 mt-1">
                {Array.isArray(r.ingredients) ? r.ingredients.slice(0,3).join(', ') : ''}
                {Array.isArray(r.ingredients) && r.ingredients.length > 3 ? '…' : ''}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
