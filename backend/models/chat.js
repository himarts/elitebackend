import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
     // Indicates if the message has been read
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
