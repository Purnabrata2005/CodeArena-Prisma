import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
});
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * Uploads a file buffer to Cloudinary
 * @param fileBuffer - The file buffer in memory
 * @param folder - The folder destination in Cloudinary
 * @returns The Cloudinary upload result
 */
export const uploadToCloudinary = (fileBuffer, folder = "avatars") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: folder,
            resource_type: "auto",
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
        uploadStream.end(fileBuffer);
    });
};
/**
 * Deletes a file from Cloudinary by its public ID
 * @param publicId - The public ID of the file to delete
 * @returns The Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    }
    catch (error) {
        console.error("Cloudinary file deletion failed:", error);
        return null;
    }
};
//# sourceMappingURL=cloudinary.js.map