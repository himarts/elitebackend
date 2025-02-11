import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Dating App Account",
    text: `Your verification code is: ${code}`
  };

  await transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async (email, code) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      text: `Your password reset code is: ${code}`
    };
  
    await transporter.sendMail(mailOptions);
  };