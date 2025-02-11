import express from "express";
import { getProfile, updateProfile, viewUserProfile, updateProfilePicture } from "../controllers/profileController.js";
import validate from "../middleware/validate.js";
import { profileUpdateValidation } from "../validators/profileValidator.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddlewares.js"; // Import the upload middleware

const router = express.Router();

router.get("/me", protect, getProfile); // Get own profile
router.put("/update", protect, validate(profileUpdateValidation), updateProfile); // Update profile
router.get("/:userId", protect, viewUserProfile); // View other profiles
router.put("/profile-picture", protect, upload.single("profilePicture"), updateProfilePicture);

export default router;
