// src/utils/socket.js
import { io } from "socket.io-client";

export const socket = io("http://localhost:5011", {
  withCredentials: true,
  autoConnect: false,
});
