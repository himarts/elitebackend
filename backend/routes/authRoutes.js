import express from "express";
import {   registerUser, 
    verifyUser, 
    loginUser, 
    forgotPassword, 
    resetPassword,
    resendVerificationCode,
    requestOtp,
    verifyOtp
    
 } from "../controllers/authControllers.js";
import validate from "../middleware/validate.js";
import {   registerValidation, 
    verifyValidation, 
    loginValidation, 
    forgotPasswordValidation, 
    resetPasswordValidation } from "../validators/validator.js";

const router = express.Router();


router.post("/register", validate(registerValidation), registerUser);
router.post("/verify", validate(verifyValidation), verifyUser);
router.post("/login", validate(loginValidation), loginUser);
router.post("/forgot-password", validate(forgotPasswordValidation), forgotPassword);
router.post("/reset-password", validate(resetPasswordValidation), resetPassword);
router.post('/resend-verification', resendVerificationCode);
// Request OTP route
router.post('/request-otp', requestOtp);

// Verify OTP route
router.post('/verify-otp', verifyOtp);

export default router;
