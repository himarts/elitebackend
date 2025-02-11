import express from 'express';
import Joi from 'joi';
import User from '../models/user.js';
import { generateVerificationCode } from '../utils/helpers.js';
import moment from 'moment';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email setup (Update with real credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS
  }
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification code
 * @access  Public
 */
router.post('/resend-verification', async (req, res) => {
  // Validate user input using Joi
  const schema = Joi.object({
    email: Joi.string().email().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified.' });
    }

    // Check if the last code was sent recently
    if (user.verificationExpires && moment(user.verificationExpires).isAfter(moment())) {
      return res.status(400).json({ message: 'Please wait before requesting another code.' });
    }

    // Generate a new verification code
    const newCode = generateVerificationCode();
    user.verificationCode = newCode;
    user.verificationExpires = moment().add(10, 'minutes').toDate(); // Code expires in 10 mins
    await user.save();

    // Send email with verification code
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${newCode}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Verification code resent successfully.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
