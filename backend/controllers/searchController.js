import User from '../models/user.js';

// Search for users by name or interests
// Search users by name or interests
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query; // Get search query from request

    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }

    // Perform a case-insensitive search for name or interests
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Search by name
        { interests: { $regex: query, $options: "i" } } // Search by interests
      ]
    }).select("-password"); // Exclude password from response

    res.status(200).json({ users });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const advancedSearch = async (req, res) => {
  try {
    const { name, ageMin, ageMax, location, gender, hobbies } = req.query;

    let filter = {};

    // Search by Name (case-insensitive)
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // Filter by Age Range
    if (ageMin || ageMax) {
      filter.age = {};
      if (ageMin) filter.age.$gte = parseInt(ageMin);
      if (ageMax) filter.age.$lte = parseInt(ageMax);
    }

    // Filter by Location (case-insensitive)
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // Filter by Gender
    if (gender) {
      filter.gender = gender;
    }

    // Filter by Hobbies (partial match)
    if (hobbies) {
      const hobbiesArray = hobbies.split(",").map(hobby => hobby.trim());
      filter.hobbies = { $in: hobbiesArray };
    }

    // Fetch users based on filter
    const users = await User.find(filter).select("-password"); // Exclude passwords

    res.status(200).json({ users });
  } catch (error) {
    console.error("Advanced Search Error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
};


