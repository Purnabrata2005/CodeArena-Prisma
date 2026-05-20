export const UserRolesEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const options = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

export class UserResponse  {
  constructor(user,extra = {}) {
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
      "refreshToken",
      "accessToken",
    ];

    fields.forEach((field) => {
      this[field] = user[field];
    });

    // Backward-compatibility alias for clients still expecting `_id`.
    this._id = user.id;

    // add extra fields like tokens
    Object.assign(this, extra);
  }
}


