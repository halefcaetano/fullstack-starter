import { useEffect, useState } from 'react';

export function useChat(socket) {
  const [messages, setMessages] = useState([]);
  const room = 'public';

  // Load chat history only once on mount or when room changes
  useEffect(() => {
    let mounted = true;
    fetch(`/api/chat/history?room=public&limit=50`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && mounted) {
          setMessages(data
            .filter(m => m.message !== `${m.username} joined public` && m.message !== 'join room')
            .map(m => ({
              room: m.room,
              username: m.username,
              message: m.message,
              replayed: true,
              ts: new Date(m.createdAt).getTime(),
            })));
        }
      })
      .catch(() => setMessages([]));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!socket) return;
    // Set socket user for optimistic UI if needed
    if (!socket.user && socket.auth && socket.auth.token) {
      try {
        const payload = JSON.parse(atob(socket.auth.token.split('.')[1]));
        socket.user = { username: payload.username || payload.email || 'user' };
      } catch {}
    }
    const onMsg = (m) => {
      console.log('[chat] received message', m);
      setMessages((prev) => [...prev, m]);
    };
    socket.on('chat:message', onMsg);
    return () => socket.off('chat:message', onMsg);
  }, [socket]);

  const send = async (text) => {
    const s = (text || '').trim();
    if (!s) return;

    console.log('[chat] sending message', s, 'to room', room);
    socket.emit('chat:message', { room: 'public', message: s });
  };

  return { room, messages, send };
}
