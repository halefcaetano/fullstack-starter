// src/pages/RecipeForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function RecipeForm() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // convert textarea into array
    const ingredients = ingredientsText
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    const formData = { title, ingredients, imageUrl, instructions };

    try {
      await API.post("/recipes", formData);
      // ✅ after creating, go back to the Home page
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Could not create recipe");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Recipe</h1>
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Ingredients (one per line or comma-separated)
          </label>
          <textarea
            className="w-full border rounded p-2 h-40"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            className="w-full border rounded p-2"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instructions</label>
          <textarea
            className="w-full border rounded p-2 h-48"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            type="submit"
          >
            Save
          </button>
          <button
            type="button"
            className="px-4 py-2 border rounded"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
