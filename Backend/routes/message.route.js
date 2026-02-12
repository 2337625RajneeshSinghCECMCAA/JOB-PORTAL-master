// routes/message.routes.js
import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import {
  sendMessage,
  getMessages,
  getUnreadTotal,
  deleteChatForMe,
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send", authenticateToken, sendMessage);
router.get("/unread-total", authenticateToken, getUnreadTotal);
router.get("/:userId", authenticateToken, getMessages);
router.delete("/delete/:userId", authenticateToken, deleteChatForMe);


export default router;
