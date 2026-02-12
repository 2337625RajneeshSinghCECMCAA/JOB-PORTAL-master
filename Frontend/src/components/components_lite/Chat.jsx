import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { socket } from "@/utils/socket";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useSelector } from "react-redux";
import Navbar from "../components_lite/Navbar";
import { MoreVertical } from "lucide-react";

const Chat = () => {
  const { id: chatUserId } = useParams();
  const { user } = useSelector((store) => store.auth);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  const scrollRef = useRef(null);
  const typingTimeout = useRef(null);

  /* ---------------- FETCH MESSAGES ---------------- */
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5011/api/message/${chatUserId}`,
        { withCredentials: true },
      );

      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  /* ---------------- SOCKET SETUP ---------------- */
  useEffect(() => {
    if (!user?._id || !chatUserId) return;

    fetchMessages();

    socket.emit("join", user._id);

    const handleReceiveMessage = (msg) => {
      if (msg.sender?._id === user._id) return;

      const isCurrentChat =
        msg.sender?._id === chatUserId || msg.receiver === chatUserId;

      if (isCurrentChat) {
        setMessages((prev) => [...prev, msg]);
        playSound();
        notify(msg.sender?.fullname, msg.text);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    socket.on("typing", ({ from }) => {
      if (from === chatUserId) setTyping(true);
    });

    socket.on("stopTyping", () => setTyping(false));

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // 🔥 SEEN EVENT (IMPORTANT)
    socket.on("messagesSeen", ({ from }) => {
      if (from === chatUserId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender?._id === user._id ? { ...m, isRead: true } : m,
          ),
        );
      }
    });

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("onlineUsers");
      socket.off("messagesSeen");
    };
  }, [chatUserId, user?._id]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        "http://localhost:5011/api/message/send",
        { receiverId: chatUserId, text },
        { withCredentials: true },
      );

      if (res.data.success) {
        const savedMessage = res.data.message;

        setMessages((prev) => [...prev, savedMessage]);

        socket.emit("sendMessage", {
          receiverId: chatUserId,
          message: savedMessage,
        });
      }

      setText("");
      socket.emit("stopTyping", { to: chatUserId });
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  /* ---------------- TYPING ---------------- */
  const handleTyping = (e) => {
    setText(e.target.value);

    socket.emit("typing", { to: chatUserId, from: user._id });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { to: chatUserId });
    }, 1000);
  };

  /* ---------------- DELETE CHAT (SOFT) ---------------- */
  const deleteChat = async () => {
    try {
      await axios.delete(
        `http://localhost:5011/api/message/delete/${chatUserId}`,
        { withCredentials: true },
      );

      setMessages([]);
      setShowMenu(false);
    } catch (err) {
      console.error("Delete chat error:", err);
    }
  };

  /* ---------------- NOTIFICATION ---------------- */
  const playSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

  const notify = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const isOnline = onlineUsers.includes(chatUserId);

  /* ---------------- CLOSE MENU ---------------- */
  useEffect(() => {
    const close = () => setShowMenu(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <>
      <Navbar />

      <div className="max-w-2xl mx-auto p-4 pt-6 flex flex-col h-[calc(100vh-64px)]">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-semibold">Chat</h2>
            <p className="text-xs">{isOnline ? "🟢 Online" : "⚪ Offline"}</p>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 rounded hover:bg-gray-200"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow w-40 z-50">
                <button
                  onClick={deleteChat}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Delete Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-3 border rounded bg-white flex flex-col gap-3">
          {messages.map((m) => {
            const isMe = m.sender?._id === user?._id;

            return (
              <div
                key={m._id}
                className={`flex gap-2 ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                {!isMe && (
                  <Avatar>
                    <AvatarImage src={m.sender?.profile?.profilePhoto} />
                  </Avatar>
                )}

                <div
                  className={`px-4 py-2 rounded-lg max-w-xs ${
                    isMe
                      ? "bg-blue-600 text-white text-right"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {!isMe && (
                    <p className="text-sm font-semibold mb-1">
                      {m.sender?.fullname}
                    </p>
                  )}

                  <p>{m.text}</p>

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {isMe && (
                    <p className="text-[10px] mt-1">
                      {m.isRead ? "✔✔ Seen" : "✔ Sent"}
                    </p>
                  )}
                </div>

                {isMe && (
                  <Avatar>
                    <AvatarImage src={user?.profile?.profilePhoto} />
                  </Avatar>
                )}
              </div>
            );
          })}

          {typing && <p className="text-sm italic text-gray-500">typing...</p>}
          <div ref={scrollRef} />
        </div>

        {/* INPUT */}
        <div className="flex gap-2 mt-3">
          <input
            value={text}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="border p-2 flex-1 rounded"
            placeholder="Type message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default Chat;

