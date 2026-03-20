import { Prisma } from "../generated/prisma/client.js";

import { ApiError } from "../utils/api-error.js";

const DB_CONNECTION_ERROR_CODES = new Set([
	"ECONNREFUSED",
	"ECONNRESET",
	"ETIMEDOUT",
	"ENOTFOUND",
	"EHOSTUNREACH",
]);

function mapPrismaError(error) {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		if (DB_CONNECTION_ERROR_CODES.has(error.code)) {
			return new ApiError(503, "Database connection failed", [{ code: error.code }], error.stack);
		}

		switch (error.code) {
			case "P2002":
				return new ApiError(
					409,
					"Unique constraint failed",
					[{ code: error.code, target: error.meta?.target }],
					error.stack,
				);
			case "P2025":
				return new ApiError(404, "Record not found", [{ code: error.code }], error.stack);
			case "P2003":
				return new ApiError(
					409,
					"Foreign key constraint failed",
					[{ code: error.code, field: error.meta?.field_name }],
					error.stack,
				);
			default:
				return new ApiError(400, error.message || "Database request error", [{ code: error.code }], error.stack);
		}
	}

	if (error instanceof Prisma.PrismaClientValidationError) {
		return new ApiError(400, "Invalid data provided", [error.message], error.stack);
	}

	if (error instanceof Prisma.PrismaClientInitializationError) {
		return new ApiError(500, "Database initialization failed", [], error.stack);
	}

	if (error instanceof Prisma.PrismaClientRustPanicError) {
		return new ApiError(500, "Database engine error", [], error.stack);
	}

	if (DB_CONNECTION_ERROR_CODES.has(error?.code)) {
		return new ApiError(503, "Database connection failed", [{ code: error.code }], error?.stack);
	}

	return null;
}

const errorHandler = (err, req, res, next) => {
	let error = err;

	if (!(error instanceof ApiError)) {
		const prismaError = mapPrismaError(error);

		if (prismaError) {
			error = prismaError;
		} else {
			const statusCode = error?.statusCode || 500;
			const message = error?.message || "Something went wrong";
			error = new ApiError(statusCode, message, error?.errors || [], error?.stack);
		}
	}

	const response = {
		statusCode: error.statusCode,
		message: error.message,
		errors: error.errors,
		success: false,
		...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
	};

	console.error(`[ERROR] ${error.message}`);

	return res.status(error.statusCode).json(response);
};

export { errorHandler };
