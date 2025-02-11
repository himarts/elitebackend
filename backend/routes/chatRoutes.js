import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; // Middleware to authenticate user
import { sendMessage, getChatHistory, markAsRead} from '../controllers/chatController.js';

const router = express.Router();

// Route to send a chat message
router.post('/send', protect, sendMessage);

// Route to mark a message as read
router.post('/read', protect, markAsRead);
// Route to get message history between two users
router.get('/history/:userId', protect, getChatHistory);


// router.post("/send", protect, sendMessage);

// Get chat history with a specific user
// router.get("/history/:userId", protect, getChatHistory);
export default router;
