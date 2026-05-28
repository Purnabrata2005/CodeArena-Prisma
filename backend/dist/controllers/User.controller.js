import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/db.js";
import path from "path";
import fs from "fs";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { UserResponse } from "../utils/constants.js";
export const updateUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(404, "User not authenticated", []);
    }
    const { name, bio } = req.body;
    const updateData = { name, bio };
    if (req.file) {
        const file = req.file;
        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.buffer, "avatars");
        const avatarUrl = result.secure_url;
        const avatarLocalPath = result.public_id; // Storing public_id for easy deletion
        updateData.avatarLocalPath = avatarLocalPath;
        updateData.avatarUrl = avatarUrl;
        // Clean up old avatar if it exists
        if (user.avatarLocalPath) {
            if (user.avatarLocalPath.startsWith("public/avatars/")) {
                // Old local file cleanup
                const oldPath = path.join(process.cwd(), user.avatarLocalPath);
                try {
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
                catch (err) {
                    console.error("Failed to delete old local avatar file:", err);
                }
            }
            else {
                // Cloudinary cleanup
                await deleteFromCloudinary(user.avatarLocalPath);
            }
        }
    }
    const updatedUser = await db.user.update({
        where: { email: user.email },
        data: updateData,
    });
    const responseUser = new UserResponse(updatedUser);
    return res.status(200).json(new ApiResponse(200, "User updated successfully", {
        user: responseUser,
    }));
});
//# sourceMappingURL=User.controller.js.map