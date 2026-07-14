import { io } from 'socket.io-client';

let socket = null;
let socketKey = '';

export function getSocket(token, type) {
  const key = `${type}:${token}`;
  if (socket && socketKey === key) return socket;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socketKey = key;
  socket = io({
    path: '/socket.io',
    auth: { token, type },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketKey = '';
  }
}

export function isSocketConnected() {
  return Boolean(socket?.connected);
}
