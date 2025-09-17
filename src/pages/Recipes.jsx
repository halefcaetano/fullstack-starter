// src/pages/Recipes.jsx

import React, { useRef, useState, useEffect } from 'react';
import { useSharedSocket } from '../hooks/SocketProvider.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { fetchRecipes } from '../api';

function RecipeNotifPopup({ notif, onClick }) {
  if (!notif) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-lg shadow-xl px-4 py-3 cursor-pointer flex items-center gap-3 border border-blue-700 hover:bg-blue-700 transition-all"
      style={{ minWidth: 260, maxWidth: 340, fontSize: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
      onClick={onClick}
    >
      {notif.imageUrl && (
        <img
          src={notif.imageUrl}
          alt={notif.title}
          className="w-10 h-10 object-cover rounded border"
          style={{ flexShrink: 0 }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-bold truncate">New Recipe!</div>
        <div className="truncate">{notif.title}</div>
      </div>
    </div>
  );
}
export default function Recipes() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [notif, setNotif] = useState(null); // for small notification
  const notifTimeout = useRef();
  const { socket } = useSharedSocket();

  useEffect(() => {
    fetchRecipes().then(setItems).catch(console.error);
  }, []);

  // Listen for new recipe events
  useEffect(() => {
    if (!socket) return;
    const onNewRecipe = (recipe) => {
      setNotif(recipe);
      setItems((prev) => [recipe, ...prev]);
      clearTimeout(notifTimeout.current);
      notifTimeout.current = setTimeout(() => setNotif(null), 5000);
    };
    socket.on('recipe:new', onNewRecipe);
    return () => {
      socket.off('recipe:new', onNewRecipe);
      clearTimeout(notifTimeout.current);
    };
  }, [socket]);


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
      {/* Small notification popup */}
      <RecipeNotifPopup
        notif={notif}
        onClick={() => {
          if (notif) {
            navigate(`/recipes/${notif._id}`);
            setNotif(null);
          }
        }}
      />
    </div>
  );
}
