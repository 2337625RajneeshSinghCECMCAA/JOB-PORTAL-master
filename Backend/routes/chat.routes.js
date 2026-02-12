import express from "express";
import { getChatUsers } from "../controllers/chat.controller.js";
import { authenticateToken } from "../middleware/isAuthenticated.js";

const router = express.Router();

// list users + unread count
router.get("/chat-users", authenticateToken, getChatUsers);

export default router;
