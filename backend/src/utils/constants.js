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
      "_id",
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

    // add extra fields like tokens
    Object.assign(this, extra);
  }
}


