import React, { useEffect, useState } from "react";
import Navbar from "../components_lite/Navbar";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/data";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useNavigate } from "react-router-dom";
import { socket } from "@/utils/socket";
import { useSelector } from "react-redux";

const Messages = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  // ---------------- FETCH CHAT USERS ----------------
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:5011/api/chat/chat-users`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  // ---------------- SOCKET + INITIAL LOAD ----------------
  useEffect(() => {
    if (!user?._id) return;

    fetchUsers();

    // ✅ join own socket room
    socket.emit("join", user._id);

    const handleRefresh = () => {
      fetchUsers();
    };

    socket.on("refreshUsers", handleRefresh);

    return () => {
      socket.off("refreshUsers", handleRefresh);
    };
  }, [user?._id]);

  return (
    <div>
      <Navbar />

      <div className="max-w-4xl mx-auto p-4 mt-6">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>

        <div className="bg-white rounded-lg shadow">
          {users.length === 0 && (
            <p className="text-center text-gray-500 p-4">
              No conversations yet
            </p>
          )}

          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => navigate(`/chat/${u._id}`)}
              className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={u?.profile?.profilePhoto} />
                </Avatar>
                <p className="font-medium">{u.fullname}</p>
              </div>

              {/* 🔴 UNREAD BADGE */}
              {u.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[22px] text-center font-semibold">
                  {u.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;
