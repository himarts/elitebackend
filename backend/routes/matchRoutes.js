import express from 'express';
import {  getMatchedUsers} from '../controllers/matchControllers.js';
import { authenticateUser } from '../middleware/authMiddleware.js'; // Middleware to authenticate users
import { getSuggestedMatches } from '../controllers/userController.js';

const router = express.Router();

// Route to get all matches
router.get('/matches', authenticateUser, getMatchedUsers);


// Route to get suggested matches based on preferences
router.get('/suggested-matches', authenticateUser, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const suggestedMatches = await getSuggestedMatches(currentUserId);

    if (suggestedMatches.length === 0) {
      return res.status(404).json({ message: "No suggested matches found." });
    }

    res.status(200).json(suggestedMatches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to fetch suggested matches." });
  }
});


export default router;
