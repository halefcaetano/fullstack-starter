import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home.jsx";
import RecipeForm from "./pages/RecipeForm.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyRecipes from "./pages/MyRecipes.jsx";
import Chat from "./pages/Chat.jsx"; // ✅ NEW

// Protect routes that require login
function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

// Header with navigation + logout
function Header() {
  const navigate = useNavigate();
  const authed = !!localStorage.getItem("token");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("sessionId"); // optional
    navigate("/login", { replace: true });
  }

  return (
    <nav style={{ display: "flex", gap: 16, padding: 12 }}>
      <Link to="/recipes">Recipes</Link>
      {authed && <Link to="/recipes/new">New Recipe</Link>}
      <Link to="/chat" className="mr-3">
        Chat
      </Link> {/* ✅ ALWAYS VISIBLE LINK */}
      <div style={{ marginLeft: "auto" }}>
        {authed ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: 12 }}>
              Login
            </Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

// Main App
export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/recipes" replace />} />
        <Route path="/recipes" element={<Home />} />
        <Route
          path="/recipes/new"
          element={
            <RequireAuth>
              <RecipeForm />
            </RequireAuth>
          }
        />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route
          path="/my"
          element={
            <RequireAuth>
              <MyRecipes />
            </RequireAuth>
          }
        />
        {/* ✅ CHAT ROUTE (no auth) */}
        <Route path="/chat" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/recipes" replace />} />
      </Routes>
    </>
  );
}
