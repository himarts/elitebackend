import User from '../models/user.js';
import geolib from 'geolib';  // To calculate distance between two points

// Calculate the similarity between two sets (e.g., interests)
const calculateInterestsSimilarity = (interests1, interests2) => {
  const intersection = interests1.filter(value => interests2.includes(value));
  return intersection.length / Math.max(interests1.length, interests2.length);
};

// Calculate Distance (in kilometers) between two users' locations (using geolib)
const calculateDistance = (location1, location2) => {
  const [lat1, lon1] = location1.split(",").map(Number);
  const [lat2, lon2] = location2.split(",").map(Number);

  return geolib.getDistance(
    { latitude: lat1, longitude: lon1 },
    { latitude: lat2, longitude: lon2 }
  ) / 1000;  // Convert to kilometers
};



// Match users based on multiple factors
export const matchUsers = async (currentUserId) => {
  try {
    const currentUser = await User.findById(currentUserId);
    const allUsers = await User.find({ _id: { $ne: currentUserId } });

    const matchedUsers = allUsers.filter(user => {
      let matchScore = 0;

      // 1. Profile Verification (give 10 points for verified users)
      if (user.verificationStatus === 'verified') {
        matchScore += 10;
      }

      // 2. Age Range Match (within 5 years)
      const ageDifference = Math.abs(user.age - currentUser.age);
      if (ageDifference <= 5) {
        matchScore += 5;
      }

      // 3. Interests Matching (Jaccard similarity)
      const interestMatch = calculateInterestsSimilarity(currentUser.interests, user.interests);
      matchScore += interestMatch * 20;  // Scale the similarity by 20

      // 4. Location Match (within 50 km radius)
      const distance = calculateDistance(currentUser.location, user.location);
      if (distance <= 50) {
        matchScore += 5;  // Add 5 points for proximity
      }

      // 5. User Preferences Matching
      if (user.lookingFor === currentUser.lookingFor) {
        matchScore += 5;  // Add 5 points for matching relationship preferences
      }

      // 6. Exclude users who have already been disliked or have disliked the current user
      if (user.dislikedUsers.includes(currentUserId) || currentUser.dislikedUsers.includes(user._id)) {
        return false;  // Don't consider these users
      }

      // If match score exceeds a threshold, consider this a match
      return matchScore >= 15;  // Only users with a score of 15 or more are considered a match
    });

    return matchedUsers;
  } catch (error) {
    console.error(error);
    throw new Error('Error matching users.');
  }
};

// Get Matches
export const getMatchedUsers = async (req, res) => {
    try {
      const currentUserId = req.user.userId;
      const matchedUsers = await matchUsers(currentUserId);
  
      if (matchedUsers.length === 0) {
        return res.status(404).json({ message: "No matches found." });
      }
  
      res.status(200).json(matchedUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Unable to fetch matches." });
    }
  };
  
 

export const getSuggestedMatches = async (currentUserId) => {
    try {
      const currentUser = await User.findById(currentUserId);
      
      const allUsers = await User.find({ _id: { $ne: currentUserId } });  // Exclude the current user
  
      const suggestedMatches = allUsers.filter(user => {
        let matchScore = 0;
  
        // 1. Relationship preference (Looking for "serious" or "casual")
        if (user.lookingFor === currentUser.lookingFor) {
          matchScore += 10;  // Score if preferences match
        }
  
        // 2. Age preference (Within the user's preferred age range)
        const isWithinAgeRange = user.age >= currentUser.preferredAgeRange.min && user.age <= currentUser.preferredAgeRange.max;
        if (isWithinAgeRange) {
          matchScore += 10;  // Score for matching age range
        }
  
        // 3. Location preference (Within the user's preferred location radius)
        const distance = calculateDistance(currentUser.location, user.location);
        if (distance <= currentUser.preferredLocationRadius) {
          matchScore += 5;  // Score for proximity
        }
  
        // 4. Interests matching (Overlap in interests)
        const commonInterests = currentUser.interests.filter(interest => user.interests.includes(interest));
        if (commonInterests.length > 0) {
          matchScore += 10;  // Score for matching interests
        }
  
        // 5. Profile Verification (Give preference to verified profiles)
        if (user.verificationStatus === 'verified') {
          matchScore += 5;  // Score for being verified
        }
  
        // 6. Exclude users who have been disliked or who have disliked the current user
        if (user.dislikedUsers.includes(currentUserId) || currentUser.dislikedUsers.includes(user._id)) {
          return false;  // Don't consider these users
        }
  
        // If match score exceeds threshold, suggest this user as a match
        return matchScore >= 20;  // Match score threshold
      });
  
      return suggestedMatches;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching suggested matches.');
    }
  };


  
