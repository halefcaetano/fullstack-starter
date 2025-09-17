import React, { createContext, useContext } from 'react';
import { useSocket } from '../hooks/useSocket.js';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const token = localStorage.getItem('token');
  const socketState = useSocket(token);
  return (
    <SocketContext.Provider value={socketState}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSharedSocket() {
  return useContext(SocketContext);
}
