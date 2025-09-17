// src/hooks/useSocket.js
import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(token) {
  const [status, setStatus] = useState('waiting');

  // Make exactly one socket for the current token
  const socket = useMemo(() => {
    if (!token) return null;
    return io('/', {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
      auth: { token },
      reconnectionAttempts: 5,
    });
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
      socket.close();
    };
  }, [socket]);

  return { socket, status };
}
