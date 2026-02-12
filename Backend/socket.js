// socket.js
import { Server } from "socket.io";

let onlineUsers = new Map(); // userId -> socketId

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // ✅ USER JOIN
    socket.on("join", (userId) => {
      if (!userId) return;

      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // ✅ SEND MESSAGE
    socket.on("sendMessage", ({ receiverId, message }) => {
      const receiverSocket = onlineUsers.get(receiverId);

      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", message);
      }
    });

    // ✍️ TYPING
    socket.on("typing", ({ to }) => {
      const sId = onlineUsers.get(to);
      if (sId) io.to(sId).emit("typing");
    });

    socket.on("stopTyping", ({ to }) => {
      const sId = onlineUsers.get(to);
      if (sId) io.to(sId).emit("stopTyping");
    });

    // 🔴 LOGOUT EVENT (IMPORTANT)
    socket.on("logout", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      }
    });

    // ❌ DISCONNECT
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      }
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};
