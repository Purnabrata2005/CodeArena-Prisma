import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { auth } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";
export const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session) {
            throw new ApiError(401, "Unauthorized", []);
        }
        req.user = session.user;
        next();
    }
    catch (error) {
        throw new ApiError(401, "Unauthorized", []);
    }
});
export const checkAdmin = asyncHandler(async (req, res, next) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Unauthorized", []);
    }
    if (user.role !== "ADMIN") {
        throw new ApiError(403, "Forbidden: ADMIN role required", []);
    }
    next();
});
//# sourceMappingURL=auth.middleware.js.map