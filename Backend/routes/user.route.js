import express from "express";
import {
  login,
  logout,
  register,
  updateProfile,
  verifyEmail,
  sendResetOTP,
  verifyResetOTP,
  resetPasswordWithOTP,
  getAllUsers,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js"; 

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.get("/verify-email/:token", verifyEmail);

router.post("/forgot-password", sendResetOTP);
router.get("/reset-password", verifyResetOTP);
router.post("/reset-password", resetPasswordWithOTP);

router.route("/login").post(login);
router.route("/logout").post(logout);
router
  .route("/profile/update")
  .post(authenticateToken, singleUpload, updateProfile);

router.post("/send", async (req, res) => {
  const { companyId, text } = req.body;

  const message = await Message.create({
    sender: req.user._id,
    receiverCompany: companyId,
    text,
  });

  res.status(201).json({ success: true, message });
});





export default router;
