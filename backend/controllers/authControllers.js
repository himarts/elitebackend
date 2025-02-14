import User from "../models/user.js";
import bcrypt from "bcryptjs";
import Joi from "joi";
import moment from 'moment';
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendResetPasswordEmail  } from "../services/emailService.js";
import { generateVerificationCode } from "../utils/verificationCode.js";
import dotenv from 'dotenv'
dotenv.config();
  // controllers/authController.js
  // import { sendOtp } from '../services/twillio.js';
  // import { generateOtp } from '../utils/otp.js';




// User Registration
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate Verification Code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: "10m" });

    // Create User
    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      verificationCode
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ message: "User registered. Check email for verification code.", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify User

export const verifyUser = async (req, res) => {
  try {
    // Get token from headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const email = decoded.email; // Ensure email is present in token
    const { verificationCode } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    return res.json({ message: "User verified successfully." });
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};



export const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) return res.status(400).json({ error: "Invalid email or password" });
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });
  
      if (!user.isVerified) return res.status(400).json({ error: "Please verify your account first" });
  
      // Generate JWT Token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
      res.json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };
  
  // ✅ Forgot Password (Send Reset Code)
  export const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) return res.status(400).json({ error: "User not found" });
      const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: "10m" });

      // Generate Reset Code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = resetCode;
      await user.save();
  
      // Send reset code via email
      await sendResetPasswordEmail(email, resetCode);
  
      res.json({ message: "Password reset code sent to email" , token});
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };


  export const verifyPasswordResetCode = async (req, res) => {
    try {
      // Get token from headers
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Invalid token format" });
      }
  
      const token = authHeader.split(" ")[1]; // Extract the token
  
      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      const email = decoded.email; // Ensure email is present in token
      const { verificationCode } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: "User not found" });
  
      if (user.verificationCode !== verificationCode) {
        return res.status(400).json({ error: "Invalid verification code" });
      }
  
      user.isVerified = true;
      user.verificationCode = null;
      await user.save();

      return res.json({ message: "User verified successfully." });
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({ error: "Invalid token" });
    }
  };
  
  
 // Adjust as per your project structure
  
  export const resetPassword = async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Reset token is required" });
      }
  
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }
  
      // Verify and decode the reset token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET); // Use a dedicated secret for reset tokens
      } catch (error) {
        return res.status(401).json({ error: "Invalid or expired reset token" });
      }
  
      const { email } = decoded;
  
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Hash new password and update user record
      user.password = await bcrypt.hash(newPassword, 10);
      user.verificationCode = null; // Clear any reset code if stored
      await user.save();
  
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Password Reset Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  };
  

  export const resendVerificationCode = async (req, res) => {
    try {
      // Get expired token from headers
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token provided." });
  
      // Decode expired token to extract email
      let email;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
        email = decoded.email;
      } catch (error) {
        return res.status(400).json({ message: "Invalid token." });
      }
  
      if (!email) return res.status(400).json({ message: "Email not found in token." });
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found." });
      if (user.isVerified) return res.status(400).json({ message: "User is already verified." });
  
      // Prevent frequent requests
      if (user.verificationExpires && moment(user.verificationExpires).isAfter(moment())) {
        return res.status(400).json({ message: "Please wait before requesting another code." });
      }
  
      // Generate new OTP
      const newOtp = generateVerificationCode();
      user.verificationCode = newOtp;
      user.verificationExpires = moment().add(10, "minutes").toDate();
      await user.save();
  
      // Generate a fresh JWT token
      const newToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
  
      // Send verification email
      await sendVerificationEmail(user.email, newOtp);
  
      res.status(200).json({
        message: "Verification code resent successfully.",
        token: newToken, // Send fresh token
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  };
  


  export const getAllUsers = async (req, res) => {
    try {
      const users = await User.find({});
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  };
  
  // @desc Delete all users
  // @route DELETE /api/users
  // @access Public
  export const deleteAllUsers = async (req, res) => {
    try {
      await User.deleteMany({});
      res.status(200).json({ message: "All users deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting users" });
    }
  };
// Store the generated OTP in memory (ideally use a database or cache system like Redis)
// let otpStorage = {};

// export const requestOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;

//     // Validate phone number (e.g., regex check)
//     if (!/^\d{10}$/.test(phone)) {
//       return res.status(400).json({ error: 'Invalid phone number format.' });
//     }

//     // Generate OTP
//     const otp = generateOtp();

//     // Store OTP in memory (ideally use a database or Redis cache with an expiration time)
//     otpStorage[phone] = otp;

//     // Send OTP via Twilio
//     await sendOtp(phone, otp);

//     res.status(200).json({ message: 'OTP sent successfully.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Something went wrong while sending OTP.' });
//   }
// };

// export const verifyOtp = (req, res) => {
//   try {
//     const { phone, otp } = req.body;

//     // Validate OTP
//     if (!otpStorage[phoneNumber] || otpStorage[phone] !== otp) {
//       return res.status(400).json({ error: 'Invalid or expired OTP.' });
//     }

//     // OTP is valid; proceed with further actions (e.g., user registration, login)
//     delete otpStorage[phone]; // Clear the OTP after successful verification

//     res.status(200).json({ message: 'OTP verified successfully.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Something went wrong while verifying OTP.' });
//   }
// };

  