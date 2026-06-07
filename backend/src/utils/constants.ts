export const UserRolesEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const options = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
};

export class UserResponse {
  [key: string]: any;
  id!: string;
  username!: string | null;
  email!: string;
  name!: string | null;
  avatarUrl!: string;
  avatarLocalPath!: string;
  role!: string;
  isEmailVerified!: boolean;
  bio!: string | null;
  _id!: string;

  constructor(user: any, extra: Record<string, any> = {}) {
    const fields = [
      "id",
      "username",
      "email",
      "name",
      "avatarUrl",
      "avatarLocalPath",
      "role",
      "isEmailVerified",
      "bio",
    ] as const;

    fields.forEach((field) => {
      (this as any)[field] = user[field];
    });

    // Backward-compatibility alias for clients still expecting `_id`.
    this._id = user.id;

    // add extra fields like tokens
    Object.assign(this, extra);
  }
}
