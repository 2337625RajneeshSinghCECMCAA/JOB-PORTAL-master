import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut, User2, MessageCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/data";
import { socket } from "@/utils/socket";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [unreadTotal, setUnreadTotal] = useState(0);

  // ---------------- FETCH UNREAD COUNT ----------------
  const fetchUnread = async () => {
    try {
      const res = await axios.get(`http://localhost:5011/api/chat/chat-users`, {
        withCredentials: true,
      });

      if (res.data.success) {
        const total = res.data.users.reduce(
          (sum, u) => sum + (u.unreadCount || 0),
          0,
        );
        setUnreadTotal(total);
      }
    } catch (err) {
      console.error("Unread fetch error:", err);
    }
  };

  // ---------------- SOCKET LIVE UPDATE ----------------
  useEffect(() => {
    if (!user?._id) return;

    // initial fetch
    fetchUnread();

    // ✅ join socket room ONCE
    socket.emit("join", user._id);

    const handleRefresh = () => {
      fetchUnread();
    };

    socket.on("refreshUsers", handleRefresh);

    return () => {
      socket.off("refreshUsers", handleRefresh);
    };
  }, [user?._id]);

  // ---------------- LOGOUT ----------------
  const logoutHandler = async () => {
    try {
      const res = await axios.post(
        `${USER_API_ENDPOINT}/logout`,
        {},
        { withCredentials: true },
      );

      if (res.data.success) {
        dispatch(setUser(null));
        setUnreadTotal(0);
        navigate("/");
        toast.success(res.data.message);
      }
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="bg-white border-b sticky top-0 z-50">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-2">
        {/* LOGO */}
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-[#6B3AC2]">Job</span>{" "}
          <span className="text-[#FA4F09]">Portal</span>{" "}
          <span className="text-[#09A8FA]">Hirelytic</span>
        </h1>

        <div className="flex items-center gap-8">
          {/* NAV LINKS */}
          <ul className="flex font-medium gap-6">
            {user?.role === "Recruiter" ? (
              <>
                <li>
                  <Link to="/admin/companies">Companies</Link>
                </li>
                <li>
                  <Link to="/admin/jobs">Jobs</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/Home">Home</Link>
                </li>
                <li>
                  <Link to="/Browse">Browse</Link>
                </li>
                <li>
                  <Link to="/Jobs">Jobs</Link>
                </li>
                <li>
                  <Link to="/Creator">About</Link>
                </li>
              </>
            )}
          </ul>

          {/* AUTH AREA */}
          {!user ? (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-red-600 hover:bg-red-700">
                  Register
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              {/* 💬 CHAT ICON + BADGE */}
              <div
                className="relative cursor-pointer"
                onClick={() => navigate("/messages")}
              >
                <MessageCircle size={24} className="hover:text-[#6B3AC2]" />

                {unreadTotal > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[20px] text-center">
                    {unreadTotal}
                  </span>
                )}
              </div>

              {/* PROFILE POPOVER */}
              <Popover>
                <PopoverTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user?.profile?.profilePhoto} />
                  </Avatar>
                </PopoverTrigger>

                <PopoverContent className="w-80">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarImage src={user?.profile?.profilePhoto} />
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{user?.fullname}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.profile?.bio}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col text-gray-600">
                    {user?.role === "Student" && (
                      <div className="flex items-center gap-2">
                        <User2 size={18} />
                        <Button variant="link">
                          <Link to="/Profile">Profile</Link>
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <LogOut size={18} />
                      <Button onClick={logoutHandler} variant="link">
                        Logout
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
