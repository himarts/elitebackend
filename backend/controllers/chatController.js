import Chat from '../models/chat.js';
import User from '../models/user.js';
import { maskPhoneNumber } from '../utils/maskPhone.js';
// Send a message from the current user to another user


// Function to mask phone numbers
// const maskPhoneNumber = (message) => {
//   return message.replace(/\b\d{10,}\b/g, "********"); // Replace 10+ digit numbers with asterisks
// };

// Send message and notify in real-time
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!message || !receiverId) {
      return res.status(400).json({ error: "Message and receiver ID are required" });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver user not found" });
    }

    // Mask phone numbers in the message
    const maskedMessage = maskPhoneNumber(message);

    // Save message in the database
    const newMessage = new Chat({
      sender: req.user.userId,
      receiver: receiverId,
      message: maskedMessage,
    });

    const savedMessage = await newMessage.save();

    // Emit message via Socket.io
    req.io.to(receiverId).emit("receive-message", {
      sender: req.user.userId,
      message: maskedMessage,
    });

    res.status(200).json(savedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Something went wrong while sending the message" });
  }
};

// Fetch chat history
export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params; // The ID of the user the chat is with
    const currentUserId = req.user.userId;

    const chatHistory = await Chat.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(chatHistory);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Something went wrong while fetching chat history" });
  }
};


export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.body; // messageId to be marked as read

    const message = await Chat.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if the current user is the receiver
    if (message.receiver.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You are not the receiver of this message' });
    }

    // Mark message as read
    message.read = true;
    await message.save();

    res.status(200).json({ message: 'Message marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while marking the message as read' });
  }
};


// Fetch message history between two users
// export const getMessageHistory = async (req, res) => {
//   try {
//     const { receiverId } = req.params;

//     const messages = await Chat.find({
//       $or: [
//         { sender: req.user.userId, receiver: receiverId },
//         { sender: receiverId, receiver: req.user.userId },
//       ],
//     }).sort({ timestamp: 1 }); // Sort messages by timestamp ascending

//     res.status(200).json(messages);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Unable to fetch message history' });
//   }
// };

