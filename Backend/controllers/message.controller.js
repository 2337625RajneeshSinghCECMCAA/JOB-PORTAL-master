import { Message } from "../models/message.model.js";

/* SEND MESSAGE */
export const sendMessage = async (req, res) => {
  const { receiverId, text } = req.body;

  let message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    text,
    isRead: false,
  });

  message = await message.populate("sender", "fullname profile.profilePhoto");

  // 🔔 notify receiver
  const io = req.app.get("io");
  if (io) {
    io.to(receiverId.toString()).emit("receiveMessage", message);
    io.to(receiverId.toString()).emit("refreshUsers");
  }

  res.status(201).json({ success: true, message });
};

/* GET CHAT + MARK READ */
export const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherUserId = req.params.userId;

    // 🔥 MARK RECEIVED MESSAGES AS READ
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: myId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      },
    );

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
      deletedFor: { $ne: myId },
    })
      .sort({ createdAt: 1 })
      .populate("sender", "fullname profile.profilePhoto");

    // 🔔 notify sender that messages are seen
    const io = req.app.get("io");
    if (io) {
      io.to(otherUserId.toString()).emit("messagesSeen", {
        from: myId.toString(),
      });
      io.to(otherUserId.toString()).emit("refreshUsers");
    }

    res.json({ success: true, messages });
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ success: false });
  }
};


/* 🔴 UNREAD COUNT */
export const getUnreadTotal = async (req, res) => {
  const count = await Message.countDocuments({
    receiver: req.user._id,
    isRead: false,
  });

  res.json({ success: true, count });
};


/* SOFT DELETE CHAT */
export const deleteChatForMe = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherUserId = req.params.userId;

    await Message.updateMany(
      {
        $or: [
          { sender: myId, receiver: otherUserId },
          { sender: otherUserId, receiver: myId },
        ],
      },
      {
        $addToSet: { deletedFor: myId },
      },
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Delete chat error:", err);
    res.status(500).json({ success: false });
  }
};
