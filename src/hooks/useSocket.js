// src/hooks/useSocket.js
import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(token) {
  const [status, setStatus] = useState('waiting');

  // Make exactly one socket for the current token
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    setStatus('waiting');
    if (!token) {
      setSocket(null);
      return;
    }
    const s = io('/', {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
      auth: { token },
      reconnectionAttempts: 5,
    });
    setSocket(s);
    return () => {
      s.close();
    };
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // helpful while debugging
    const onAny = (event, ...args) => console.log('[socket]', event, ...args);
    socket.onAny(onAny);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.offAny(onAny);
    };
  }, [socket]);

  return { socket, status };
}
