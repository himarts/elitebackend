import User from '../models/user.js';
import { matchUsers } from './matchControllers.js';
// Like a User
export const likeUser = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { likedUserId } = req.params;

    // Ensure the user is not liking themselves
    if (currentUserId === likedUserId) {
      return res.status(400).json({ error: "You cannot like yourself." });
    }

    const currentUser = await User.findById(currentUserId);
    const likedUser = await User.findById(likedUserId);

    if (!likedUser) {
      return res.status(404).json({ error: "Liked user not found." });
    }

    // Check if the liked user is in dislikedUsers
    const dislikedIndex = currentUser.dislikedUsers.indexOf(likedUserId);
    if (dislikedIndex !== -1) {
      // Remove from dislikedUsers
      currentUser.dislikedUsers.splice(dislikedIndex, 1);
    }

    // Ensure the user is not already in likedUsers
    if (!currentUser.likedUsers.includes(likedUserId)) {
      currentUser.likedUsers.push(likedUserId);
    }

    await currentUser.save();

    // Check if the liked user has already liked the current user (mutual like)
    if (likedUser.likedUsers.includes(currentUserId)) {
      // Add to both users' matches
      if (!currentUser.matches.includes(likedUserId)) {
        currentUser.matches.push(likedUserId);
        likedUser.matches.push(currentUserId);
        await currentUser.save();
        await likedUser.save();
        return res.status(200).json({ message: "It's a match!" });
      }
    }

    res.status(200).json({ message: "User liked successfully." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};


// Dislike a User
export const dislikeUser = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { dislikedUserId } = req.params;

    // Ensure the user is not disliking themselves
    if (currentUserId === dislikedUserId) {
      return res.status(400).json({ error: "You cannot dislike yourself." });
    }

    const currentUser = await User.findById(currentUserId);
    const dislikedUser = await User.findById(dislikedUserId);

    if (!dislikedUser) {
      return res.status(404).json({ error: "Disliked user not found." });
    }

    // Check if the disliked user is in likedUsers
    const likedIndex = currentUser.likedUsers.indexOf(dislikedUserId);
    if (likedIndex !== -1) {
      // Remove from likedUsers
      currentUser.likedUsers.splice(likedIndex, 1);
    }

    // Ensure the user is not already in dislikedUsers
    if (!currentUser.dislikedUsers.includes(dislikedUserId)) {
      currentUser.dislikedUsers.push(dislikedUserId);
    }

    await currentUser.save();

    res.status(200).json({ message: "User disliked successfully." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};


const calculateDistance = (location1, location2) => {
    const [lat1, lon1] = location1.split(",").map(Number);
    const [lat2, lon2] = location2.split(",").map(Number);
  
    return geolib.getDistance(
      { latitude: lat1, longitude: lon1 },
      { latitude: lat2, longitude: lon2 }
    ) / 1000;  // Convert to kilometers
  };

