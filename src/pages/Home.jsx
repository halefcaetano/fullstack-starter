// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecipes, toggleLike } from "../api";

export default function Home() {
  const [items, setItems] = useState([]);
  const [sort, setSort] = useState(""); // '' or 'likes'
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function load() {
    try {
      const data = await fetchRecipes(sort);
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
  }, [sort]);

  async function onLike(id) {
    if (!token) {
      alert("Please log in to like recipes.");
      return;
    }

    // optimistic UI
    setItems((prev) =>
      prev.map((r) =>
        r._id === id
          ? {
              ...r,
              liked: !r.liked,
              likesCount: r.liked ? r.likesCount - 1 : r.likesCount + 1,
            }
          : r
      )
    );

    try {
      const { liked, likes } = await toggleLike(id);
      setItems((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, liked, likesCount: likes } : r
        )
      );
    } catch (e) {
      // revert on failure
      setItems((prev) =>
        prev.map((r) =>
          r._id === id
            ? {
                ...r,
                liked: !r.liked,
                likesCount: r.liked ? r.likesCount + 1 : r.likesCount - 1,
              }
            : r
        )
      );
      alert("Failed to toggle like.");
      console.error(e);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Recipes</h1>

        <div className="flex items-center gap-3">
          <label className="text-sm">
            Sort:
            <select
              className="ml-2 border rounded px-2 py-1"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Newest</option>
              <option value="likes">Most Liked</option>
            </select>
          </label>

          <Link
            className="px-3 py-2 rounded bg-blue-600 text-white"
            to="/recipes/new"
          >
            New Recipe
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((r) => (
          <article
            key={r._id}
            className="border rounded-lg overflow-hidden hover:shadow"
          >
            <div className="p-2 text-xs text-gray-500">
              by {r.author?.username || "Anonymous"}
            </div>

            <Link to={`/recipes/${r._id}`}>
              {r.imageUrl ? (
                <img
                  src={r.imageUrl}
                  alt={r.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  No Image
                </div>
              )}
              <div className="p-3">
                <div className="font-semibold">{r.title}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {Array.isArray(r.ingredients)
                    ? r.ingredients.slice(0, 3).join(", ")
                    : ""}
                  {Array.isArray(r.ingredients) && r.ingredients.length > 3
                    ? "…"
                    : ""}
                </div>
              </div>
            </Link>

            <div className="px-3 pb-3">
              <div className="mt-1 flex items-center justify-between">
                <button
                  onClick={() => onLike(r._id)}
                  className={`px-3 py-1 rounded text-sm ${
                    r.liked
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {r.liked ? "Unlike" : "Like"}
                </button>
                <span className="text-sm">
                  {r.likesCount} {r.likesCount === 1 ? "like" : "likes"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-gray-500 mt-6">No recipes yet.</p>
      )}
    </div>
  );
}
