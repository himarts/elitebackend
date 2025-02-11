import express from 'express';
import { likeUser, dislikeUser } from '../controllers/likesDislikes.js';
import { authenticateUser,protect} from '../middleware/authMiddleware.js'; // Middleware to authenticate users

const router = express.Router();

// Route to like a user
router.post('/like/:likedUserId', protect, likeUser);

// Route to dislike a user
router.post('/dislike/:dislikedUserId', protect, dislikeUser);

// Route to get all matches
// router.get('/matches', authenticateUser, getMatchedUsers);


export default router;
