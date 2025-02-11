import User from "../models/user.js";
import { uploadImage } from "../services/cloudinaryService.js";
// ✅ Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -verificationCode");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ View Other User Profiles
export const viewUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password -verificationCode");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Update Profile Picture
export const updateProfilePicture = async (req, res) => {
    try {
      const { file } = req.files; // Assuming the file is sent as part of multipart form data
  
      if (!file) return res.status(400).json({ error: "No file uploaded" });
  
      const uploadedFile = await uploadImage(file.path); // Upload to Cloudinary
      const profilePicture = uploadedFile.secure_url; // Get the secure URL
  
      // Update the user's profile with the Cloudinary URL
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { profilePicture },
        { new: true }
      );
  
      if (!user) return res.status(404).json({ error: "User not found" });
  
      res.json({ message: "Profile picture updated", profilePicture: user.profilePicture });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };
  