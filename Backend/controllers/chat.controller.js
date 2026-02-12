import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";

export const getChatUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } });

    const usersWithUnread = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await Message.countDocuments({
          sender: user._id,
          receiver: req.user._id,
          isRead: false,
        });

        return {
          ...user.toObject(),
          unreadCount: unreadCount || 0, // 👈 force number
        };
      }),
    );

    res.json({
      success: true,
      users: usersWithUnread,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
