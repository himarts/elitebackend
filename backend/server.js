import express from 'express';
import dotenv from 'dotenv';
import http from "http";
import { Server } from "socket.io";
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './config/db.js'; // Import MongoDB connection function
import authRoutes from './routes/authRoutes.js';
import profileRoutes from "./routes/profileRoutes.js";
import likesDislikesRoutes from './routes/likesDislikesRoute.js';
import searchRoutes from './routes/searchRoutes.js';
import chatRoute from './routes/chatRoutes.js';
// Load environment variables
dotenv.config();

const app = express();

// const server = http.createServer(app);
// const io = socketIo(server);
// Connect to MongoDB
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


// Middleware to attach `io` to `req`
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/likes", likesDislikesRoutes);
app.use("/api/users", searchRoutes);
app.use("/api/users", chatRoute)


// Store connected users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Store user when they join
  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  // Handle sending messages
  socket.on("send-message", async ({ senderId, receiverId, message }) => {
    const maskedMessage = maskPhoneNumber(message); // Mask phone numbers

    // Save message to database
    const newMessage = new Chat({
      sender: senderId,
      receiver: receiverId,
      message: maskedMessage,
    });

    await newMessage.save();

    // Send message to the receiver in real-time if they are online
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", {
        senderId,
        message: maskedMessage,
      });
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    }
  });
});



app.get('/', (req, res) => {
  res.send('Welcome to the EliteHarmony');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
