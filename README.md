# CodeArena (Prisma)

CodeArena is a coding platform backend built with Express, Prisma, and PostgreSQL.
This repository currently contains a working backend auth flow and a frontend folder scaffold.

## Tech Stack

- Node.js
- Express 5
- Prisma ORM with PostgreSQL
- JWT Authentication (access + refresh token)
- Zod validation
- Nodemailer + Mailgen (email verification)
- pnpm

## Project Structure

- backend: Express API, Prisma schema, migrations, generated Prisma client
- frontend: Frontend app folder (currently scaffold only)

## Backend Features (Current)

- User registration
- Email verification by token
- User login/logout
- Get current user profile
- Update current user profile

## Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database
- Mailtrap account (or equivalent SMTP test provider)

## Environment Variables

Create a file named .env inside the backend folder.

Required variables:

		PORT=8000
		NODE_ENV=development
		CORS_ORIGIN=http://localhost:5173

		DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=prefer

		ACCESS_TOKEN_SECRET=your_access_token_secret
		ACCESS_TOKEN_EXPIRY=1d

		REFRESH_TOKEN_SECRET=your_refresh_token_secret
		REFRESH_TOKEN_EXPIRY=7d

		MAILTRAP_HOST=smtp.mailtrap.io
		MAILTRAP_PORT=2525
		MAILTRAP_USERNAME=your_mailtrap_username
		MAILTRAP_PASSWORD=your_mailtrap_password
		MAILTRAP_SENDEREMAIL=no-reply@codearena.dev

## Installation and Run (Backend)

1. Move to backend directory.

			 cd backend

2. Install dependencies.

			 pnpm install

3. Apply migrations.

			 pnpm prisma migrate dev

4. Start development server.

			 pnpm dev

Server default URL:

		http://localhost:8000

## API Base Route

		/api/v1/auth

## Auth Endpoints

- POST /register
	- Registers a user and sends email verification link.

- GET /verify/:token
	- Verifies user email.

- POST /login
	- Logs in verified user and sets cookies.

- POST /logout
	- Protected route. Clears auth cookies.

- GET /me
	- Protected route. Returns current authenticated user.

- PATCH /update
	- Protected route. Updates name and bio.

## Notes

- Prisma client is generated into backend/src/generated/prisma.
- Static assets are served from backend/public.
- CORS origin can be comma-separated for multiple frontend URLs.

## Future Improvements

- Add problem CRUD and submissions API
- Add test coverage
- Add dockerized local development setup
- Complete frontend integration

