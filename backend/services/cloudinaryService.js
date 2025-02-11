import cloudinary from "cloudinary";

// Function to upload an image to Cloudinary
export const uploadImage = async (file) => {
  try {
    const result = await cloudinary.v2.uploader.upload(file, {
      folder: "dating-app/profile-pictures",
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });
    return result;
  } catch (error) {
    throw new Error("Error uploading image to Cloudinary");
  }
};
