import User from "../models/user.js";

// Middleware to check if the user is verified
export const checkVerificationStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.verificationStatus === 'unverified') {
      return res.status(403).json({ error: "You need to verify your profile before using this feature." });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
