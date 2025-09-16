// src/pages/Chat.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

// Map the page origin to the backend host.
// Example: https://abc-5173.app.github.dev -> https://abc-4000.app.github.dev
function detectBase() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const m = origin.match(/^(https?:\/\/.+)-\d+(\.app\.github\.dev)$/);
  if (m) return `${m[1]}-4000${m[2]}`;               // Codespaces/app.github.dev
  if (/localhost|127\.0\.0\.1/.test(origin)) return "http://localhost:4000"; // local
  return origin;                                      // fallback (same origin)
}

const API_BASE = detectBase();

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  const username = localStorage.getItem("username") || "Anonymous";

  // Connect both 5173 & 5174 to the SAME backend
  const socket = useMemo(
    () => io(API_BASE, { path: "/socket.io", autoConnect: true }),
    []
  );

  // Load persisted history (so refresh keeps messages)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/history?limit=200`, { credentials: "omit" });
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn("history failed", e);
      }
    })();
  }, []);

  // Realtime updates from everyone
  useEffect(() => {
    const onMsg = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("chat:message", onMsg);
    socket.on("connect_error", (e) => console.warn("socket error:", e?.message));
    return () => {
      socket.off("chat:message", onMsg);
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // optimistic so you see it instantly
    setMessages((prev) => [
      ...prev,
      { _id: `local-${Date.now()}`, text, username, createdAt: new Date().toISOString() },
    ]);
    socket.emit("chat:message", { text, username });
    setInput("");
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-neutral-100">Global Chat</h1>
      <div className="border rounded-lg p-3 h-96 overflow-y-auto bg-neutral-900">
        {messages.map((m) => (
          <div key={m._id || m.createdAt + m.username} className="mb-2">
            <div className="text-xs text-neutral-400">
              {new Date(m.createdAt).toLocaleTimeString()} · <span className="font-semibold">{m.username}</span>
            </div>
            <div className="text-sm text-neutral-100">{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={sendMessage} className="mt-2 flex gap-2">
        <input
          className="flex-1 border rounded-lg p-2 bg-neutral-800 text-neutral-100 placeholder-neutral-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
        />
        <button type="submit" className="px-4 py-2 rounded-lg border shadow-sm text-neutral-100">Send</button>
      </form>
    </div>
  );
}
