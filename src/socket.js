import { io } from 'socket.io-client';

export function connectSocket(token) {
  return io('/', {
    path: '/socket.io',        // Vite -> proxy -> backend:4000
    transports: ['websocket'], // skip long-polling
    withCredentials: true,
    auth: { token },
  });
}
