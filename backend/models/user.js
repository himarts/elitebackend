import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: { type: String },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    otp: {
      type: String,
    },
    expiresAt: {
      type: Date,
  
    },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String }, 
    verificationStatus: { type: String, enum: ['unverified', 'verified'], default: 'unverified' },
    // Profile Information
  gender: { type: String, enum: ["Male", "Female", "Non-binary", "Other"] },
  dateOfBirth: { type: Date },
  location: { type: String },
  relationshipStatus: { type: String, enum: ["Single", "Divorced", "Widowed"] },
  lookingFor: { type: String, enum: ["Serious Relationship", "Friendship", "Casual Dating"] },
  preferredAgeRange: { type: [Number] }, // Example: [25, 40]
  genderPreference: { type: String, enum: ["Male", "Female", "Non-binary", "Any"] },
  children: { type: String, enum: ["No children", "Has children", "Open to children"] },
  likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],   // Users liked by the current user
  dislikedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users disliked by the current user
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  
  interests: [String],         // Array of user interests
  age: { type: Number },
  preferredAgeRange: {
    min: { type: Number, default: 18 },
    max: { type: Number, default: 100 }
  },
  preferredLocationRadius: { type: Number, default: 50 },

  // Professional & Lifestyle
  occupation: { type: String },
  company: { type: String },
  educationLevel: { type: String, enum: ["High School", "Bachelor’s", "Master’s", "PhD"] },
  incomeRange: { type: String }, // "$50k-$100k"
  workSchedule: { type: String, enum: ["Full-time", "Part-time", "Freelancer", "Self-employed"] },
  workLifeBalance: { type: String, enum: ["Workaholic", "Flexible", "Balanced"] },

  // Interests & Lifestyle
  hobbies: { type: [String] },
  languagesSpoken: { type: [String] },
  religion: { type: String },
  politics: { type: String },
  dietaryPreferences: { type: String },
  smoking: { type: String, enum: ["Smoker", "Non-smoker", "Social Smoker"] },
  drinking: { type: String, enum: ["Non-drinker", "Social Drinker", "Regular Drinker"] },

  // Profile Customization
  profilePicture: { type: String },
  photoGallery: { type: [String] },
  bio: { type: String, maxlength: 300 },
  socialLinks: { type: Map, of: String }, // Example: { instagram: "link", linkedin: "link" }

  // Activity & Privacy
  lastSeen: { type: Date, default: Date.now },
  accountVisibility: { type: String, enum: ["Public", "Private", "Only Matches"], default: "Public" },
  matchPreferences: { type: String, enum: ["Anyone", "Only Preferred Matches"], default: "Anyone" },
  notificationSettings: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },

    createdAt: { type: Date, default: Date.now }

  }
);

const User = mongoose.model("User", userSchema);
export default User;
