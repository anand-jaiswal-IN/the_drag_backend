import jwt from "jsonwebtoken";

const access_token_secret =
  process.env.ACCESS_TOKEN_SECRET! ||
  "f50a5d7c3b015f801d13435923ab8dd24b9896abe081877fd632cf47b5dd814a";
const refresh_token_secret =
  process.env.REFRESH_TOKEN_SECRET! ||
  "30b7f112be7f9ee0b578544b31c40a04d1ded591632b0dff8884785fe6765af7";
const access_token_expiration = process.env.ACCESS_TOKEN_EXPIRATION! || "15m";
const refresh_token_expiration = process.env.REFRESH_TOKEN_EXPIRATION! || "7d";

import { User } from "@prisma/client";

export const generateAccessToken = (user: User) => {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    isStaff: user.isStaff,
    haveProfile: user.haveProfile,
  };
  return jwt.sign(payload, access_token_secret, {
    expiresIn: access_token_expiration,
  });
};

export const generateRefreshToken = (user: User) => {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    isStaff: user.isStaff,
    haveProfile: user.haveProfile,
  };
  return jwt.sign(payload, refresh_token_secret, {
    expiresIn: refresh_token_expiration,
  });
};
