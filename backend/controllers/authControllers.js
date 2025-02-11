import User from "../models/user.js";
import bcrypt from "bcryptjs";
import Joi from "joi";
import moment from 'moment';
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendResetPasswordEmail  } from "../services/emailService.js";
import { generateVerificationCode } from "../utils/verificationCode.js";
  // controllers/authController.js
  import { sendOtp } from '../services/twillio.js';
  import { generateOtp } from '../utils/otp.js';
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

    res.status(201).json({ message: "User registered. Check email for verification code." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify User
export const verifyUser = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = null; 
    await user.save();

    res.json({ message: "User verified successfully." });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
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
  
      // Generate Reset Code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = resetCode;
      await user.save();
  
      // Send reset code via email
      await sendResetPasswordEmail(email, resetCode);
  
      res.json({ message: "Password reset code sent to email" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };
  
  // ✅ Reset Password
  export const resetPassword = async (req, res) => {
    try {
      const { email, resetCode, newPassword } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) return res.status(400).json({ error: "User not found" });
  
      if (user.verificationCode !== resetCode) {
        return res.status(400).json({ error: "Invalid reset code" });
      }
  
      // Hash new password
      user.password = await bcrypt.hash(newPassword, 10);
      user.verificationCode = null; // Clear the reset code
      await user.save();
  
      res.json({ message: "Password reset successful" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };

  export const resendVerificationCode = async (req, res) => {
    // Validate input
    const schema = Joi.object({
      email: Joi.string().email().required()
    });
  
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
  
    try {
      const user = await User.findOne({ email: req.body.email });
  
      if (!user) return res.status(404).json({ message: 'User not found.' });
      if (user.isVerified) return res.status(400).json({ message: 'User is already verified.' });
  
      // Prevent frequent requests
      if (user.verificationExpires && moment(user.verificationExpires).isAfter(moment())) {
        return res.status(400).json({ message: 'Please wait before requesting another code.' });
      }
  
      // Generate and save new verification code
      const newCode = generateVerificationCode();
      user.verificationCode = newCode;
      user.verificationExpires = moment().add(10, 'minutes').toDate();
      await user.save();
  
      // Send verification email
      await sendVerificationEmail(user.email, newCode);
  
      res.status(200).json({ message: 'Verification code resent successfully.' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  };



// Store the generated OTP in memory (ideally use a database or cache system like Redis)
let otpStorage = {};

export const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number (e.g., regex check)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format.' });
    }

    // Generate OTP
    const otp = generateOtp();

    // Store OTP in memory (ideally use a database or Redis cache with an expiration time)
    otpStorage[phone] = otp;

    // Send OTP via Twilio
    await sendOtp(phone, otp);

    res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while sending OTP.' });
  }
};

export const verifyOtp = (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Validate OTP
    if (!otpStorage[phoneNumber] || otpStorage[phone] !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // OTP is valid; proceed with further actions (e.g., user registration, login)
    delete otpStorage[phone]; // Clear the OTP after successful verification

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while verifying OTP.' });
  }
};

  