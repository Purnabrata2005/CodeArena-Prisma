import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/api-error.js";

export const validate = (schema: ZodSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): any => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
      const error = new ApiError(422, "Validation failed", errors);
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors,
      });
    }
    next();
  };
};
