import { io } from "socket.io-client";

const url = import.meta.env.VITE_SOCKET_URL ?? (import.meta.env.DEV ? "http://localhost:3001" : undefined);

export const socket = io(url, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});
