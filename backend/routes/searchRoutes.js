import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { searchUsers } from '../controllers/searchController.js';

const router = express.Router();

// Route to search users by name or interests
router.get('/search', protect, searchUsers);
router.get('/search/advanced', protect, searchUsers);

export default router;
