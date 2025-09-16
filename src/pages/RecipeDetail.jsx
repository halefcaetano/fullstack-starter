// src/pages/RecipeDetail.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteRecipe, fetchRecipeById } from '../api';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [r, setR] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecipeById(id)
      .then(setR)
      .catch(e => setError(e?.response?.data?.error || 'Failed to load'));
  }, [id]);

  async function onDelete() {
    if (!confirm('Delete this recipe?')) return;
    try {
      await deleteRecipe(id);
      navigate('/');
    } catch (e) {
      alert(e?.response?.data?.error || 'Delete failed');
    }
  }

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!r) return <div className="p-4">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-start gap-4">
        {r.imageUrl ? (
          <img
            src={r.imageUrl}
            alt={r.title}
            className="w-56 h-56 object-cover rounded"
          />
        ) : null}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{r.title}</h1>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 12 }}>
            by {r.author?.username || 'Anonymous'}
          </div>

          <div className="flex gap-2 mt-3">
            <Link
              className="px-3 py-2 rounded border"
              to={`/recipes/${r._id}/edit`}
            >
              Edit
            </Link>
            <button
              className="px-3 py-2 rounded bg-red-600 text-white"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc ml-6">
          {(r.ingredients || []).map((i, idx) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      </div>

      {r.instructions ? (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Instructions</h2>
          <div className="whitespace-pre-wrap">{r.instructions}</div>
        </div>
      ) : null}
    </div>
  );
}
