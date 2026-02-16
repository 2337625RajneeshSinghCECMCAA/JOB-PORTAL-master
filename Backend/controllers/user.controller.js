import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloud.js";
import crypto from "crypto";
import { SendEmail } from "../middleware/nodemailer.js";

export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, adharcard, pancard, role } =
      req.body;

    if (
      !fullname ||
      !email ||
      !phoneNumber ||
      !password ||
      !role ||
      !pancard ||
      !adharcard
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "Email already exists",
        success: false,
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        message: "Profile image required",
        success: false,
      });
    }

    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔐 Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await User.create({
      fullname,
      email,
      phoneNumber,
      adharcard,
      pancard,
      password: hashedPassword,
      role,
      isVerified: false,
      profile: {
        profilePhoto: cloudResponse.secure_url,
      },
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    const verificationLink = `${process.env.SERVER_URL}/api/user/verify-email/${verificationToken}`;

    await SendEmail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Email Verification</h2>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return res.status(201).json({
      message: "Registration successful. Please check your email to verify.",
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error during registration",
      success: false,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    // ❌ Invalid or expired token
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?status=invalid`);
    }

    // ✅ Already verified
    if (user.isVerified) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?status=already_verified`,
      );
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save();

    // ✅ Success → login page
    return res.redirect(`${process.env.CLIENT_URL}/login?status=verified`);
  } catch (error) {
    console.error(error);
    return res.redirect(`${process.env.CLIENT_URL}/login?status=error`);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: "You don't have the necessary role to access this resource",
        success: false,
      });
    }

    const tokenData = {
      userId: user._id,
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const sanitizedUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      adharcard: user.adharcard,
      pancard: user.pancard,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "Strict",
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user: sanitizedUser,
        success: true,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error login failed",
      success: false,
    });
  }
};

// ========== sendResetOTP ========== //

export const sendResetOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.resetOtp = otp;
    user.resetOtpExpiresAt = otpExpiresAt;
    user.resetOtpVerified = false;
    await user.save();

    const html = `
      <h2>Password Reset OTP</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
    `;

    await SendEmail({
      to: email, // ✅ THIS WAS MISSING
      subject: "Password Reset OTP",
      html,
    });

    res.json({
      success: true,
      message: "Reset OTP sent to your email",
    });
  } catch (err) {
    console.error("Send Reset OTP error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to send reset OTP" });
  }
};

// ========== verifyResetOTP   ========== //

export const verifyResetOTP = async (req, res) => {
  const { email, otp } = req.query;
  if (!email || !otp)
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });

  try {
    const user = await User.findOne({ email });

    if (!user || !user.resetOtp || !user.resetOtpExpiresAt)
      return res.status(400).json({
        success: false,
        message: "No reset OTP found. Please request again.",
      });

    if (user.resetOtpExpiresAt < new Date())
      return res
        .status(400)
        .json({ success: false, message: "Reset OTP has expired" });

    if (user.resetOtp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    user.resetOtpVerified = true;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified. You can now reset your password.",
    });
  } catch (err) {
    console.error("Verify Reset OTP error:", err);
    res
      .status(500)
      .json({ success: false, message: "OTP verification failed" });
  }
};

// ========== resetPasswordWithOTP ========== //

export const resetPasswordWithOTP = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.resetOtpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP not verified or user not found",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpiresAt = null;
    user.resetOtpVerified = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Redirecting to login...",
      redirectUrl: "/login?reset=1",
    });
  } catch (err) {
    console.error("Reset Password error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to reset password" });
  }
};

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error logging out",
      success: false,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, phoneNumber, bio, skills } = req.body;
    const file = req.file;

    const userId = req.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (fullname) user.fullname = fullname;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;

    if (skills) {
      user.profile.skills = skills.split(",").map((s) => s.trim());
    }

    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "raw",
        folder: "resumes",
        public_id: `${Date.now()}_${file.originalname}`,
        content_disposition: "attachment",
        use_filename: true,
        unique_filename: false,
      });

      user.profile.resume = cloudResponse.secure_url;
      user.profile.resumeOriginalName = file.originalname;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email, // returned but NOT editable
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error updating profile",
      success: false,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const users = await User.find({
      _id: { $ne: loggedInUser },
    }).select("fullname profile.profilePhoto");

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// import { User } from "../models/user.model.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import getDataUri from "../utils/datauri.js";
// import cloudinary from "../utils/cloud.js";

// export const register = async (req, res) => {
//   try {
//     const { fullname, email, phoneNumber, password, adharcard, pancard, role } =
//       req.body;

//     if (
//       !fullname ||
//       !email ||
//       !phoneNumber ||
//       !password ||
//       !role ||
//       !pancard ||
//       !adharcard
//     ) {
//       return res.status(404).json({
//         message: "Missing required fields",
//         success: false,
//       });
//     }
//     const file = req.file;
//     const fileUri = getDataUri(file);
//     const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

//     const user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({
//         message: "Email already exists",
//         success: false,
//       });
//     }
//     const user = await User.findOne({ adharcard });
//     if (adharcard) {
//       return res.status(400).json({
//         message: "Adharnumber already exists",
//         success: false,
//       });
//     }
//     const user = await User.findOne({ pancard });
//     if (pancard) {
//       return res.status(400).json({
//         message: "Pan number already exists",
//         success: false,
//       });
//     }
//     //convert passwords to hashes
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       fullname,
//       email,
//       phoneNumber,
//       adharcard,
//       pancard,
//       password: hashedPassword,
//       role,
//       profile: {
//         profilePhoto: cloudResponse.secure_url,
//       },
//     });

//     await newUser.save();

//     return res.status(200).json({
//       message: `Account created successfully ${fullname}`,
//       success: true,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Server Error registering user",
//       success: false,
//     });
//   }
// };

// export const login = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

//     if (!email || !password || !adharcard || !role) {
//       return res.status(404).json({
//         message: "Missing required fields",
//         success: false,
//       });
//     }
//     let user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         message: "Incorrect email or password",
//         success: false,
//       });
//     }
//     let user = await User.findOne({ adharcard });
//     if (adharcard) {
//       return res.status(404).json({
//         message: "Incorrect Adhar Number",
//         success: false,
//       });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(404).json({
//         message: "Incorrect email or password",
//         success: false,
//       });
//     }
//     //check role correctly or not
//     if (user.role !== role) {
//       return res.status(403).json({
//         message: "You don't have the necessary role to access this resource",
//         success: false,
//       });
//     }

//     //generate token
//     const tokenData = {
//       userId: user._id,
//     };
//     const token = await jwt.sign(tokenData, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     user = {
//       _id: user._id,
//       fullname: user.fullname,
//       email: user.email,
//       phoneNumber: user.phoneNumber,
//       adharcard: user.adharcard,
//       pancard: user.pancard,
//       role: user.role,
//       profile: user.profile,
//     };

//     return res
//       .status(200)
//       .cookie("token", token, {
//         maxAge: 1 * 24 * 60 * 60 * 1000,
//         httpOnly: true,
//         sameSite: "Strict",
//       })
//       .json({
//         message: `Welcome back ${user.fullname}`,
//         user,
//         success: true,
//       });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Server Error login failed",
//       success: false,
//     });
//   }
// };

// export const logout = async (req, res) => {
//   try {
//     return res.status(200).cookie("token", "", { maxAge: 0 }).json({
//       message: "Logged out successfully.",
//       success: true,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     console.log("Uploaded file:", req.file);
//     console.log("Request body:", req.body);

//     const { fullname, email, phoneNumber, bio, skills } = req.body;
//     const file = req.file;

//     // Check if file is uploaded

//     //cloudinary upload
//     const fileUri = getDataUri(file);
//     const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

//     // Initialize userId at the beginning
//     const userId = req.id; // middleware authentication

//     // Check if userId is valid
//     let user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         message: "User  not found",
//         success: false,
//       });
//     }

//     // Process skills if provided
//     let skillsArray;
//     if (skills) {
//       skillsArray = skills.split(",");
//     }

//     // Update user profile
//     if (fullname) {
//       user.fullname = fullname;
//     }
//     if (email) {
//       user.email = email;
//     }
//     if (phoneNumber) {
//       user.phoneNumber = phoneNumber;
//     }
//     if (bio) {
//       user.profile.bio = bio;
//     }
//     if (skills) {
//       user.profile.skills = skillsArray;
//     }
//     //resume
//     if (cloudResponse) {
//       user.profile.resume = cloudResponse.secure_url;
//       user.profile.resumeOriginalName = file.originalname;
//     }

//     // Save updated user
//     await user.save();

//     user = {
//       _id: user._id,
//       fullname: user.fullname,
//       email: user.email,
//       phoneNumber: user.phoneNumber,
//       role: user.role,
//       profile: user.profile,
//     };

//     return res.status(200).json({
//       message: "Profile updated successfully",
//       user,
//       success: true,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Server Error updating profile",
//       success: false,
//     });
//   }
// };
