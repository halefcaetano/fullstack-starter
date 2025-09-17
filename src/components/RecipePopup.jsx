
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecipePopup({ recipe, onClose }) {
  const navigate = useNavigate();
  if (!recipe) return null;
  const goToRecipe = () => {
    onClose?.();
    navigate(`/recipes/${recipe._id}`);
  };
  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      style={{ minWidth: 320, maxWidth: 360 }}
      onClick={goToRecipe}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-4 border border-blue-500 cursor-pointer flex items-center gap-3 relative hover:shadow-2xl transition-all"
        style={{ minWidth: 320, maxWidth: 360 }}
        onClick={e => { e.stopPropagation(); goToRecipe(); }}
      >
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-16 h-16 object-cover rounded mr-2 border"
            style={{ flexShrink: 0 }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-blue-700 truncate">New Recipe Added!</div>
          <div className="font-semibold truncate">{recipe.title}</div>
          <div className="text-xs text-gray-500 truncate">
            {Array.isArray(recipe.ingredients) ? recipe.ingredients.slice(0, 3).join(', ') : recipe.ingredients}
            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 3 ? '…' : ''}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onClose?.(); }}
          className="absolute top-1 right-2 text-gray-400 hover:text-gray-700 text-lg"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
