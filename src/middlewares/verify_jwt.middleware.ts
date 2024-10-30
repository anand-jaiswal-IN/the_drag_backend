import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { api_response_error } from "../helpers/api_response";
import prisma from "../db/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../helpers/generate_auth_token";

const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const access_token = req.cookies.access_token;
  if (!access_token) {
    api_response_error(res, 401, "Unauthorized to access, login first.");
    return;
  }
  try {
    const access_token_secret =
      process.env.ACCESS_TOKEN_SECRET! ||
      "f50a5d7c3b015f801d13435923ab8dd24b9896abe081877fd632cf47b5dd814a";

    jwt.verify(
      access_token,
      access_token_secret,
      async (err: any, decoded: any) => {
        if (err) {
          if (err.name == "TokenExpiredError") {
            const refresh_token = req.cookies.refresh_token;
            if (!refresh_token) {
              api_response_error(
                res,
                401,
                "Unauthorized to access, login first."
              );
              return;
            }
            if (!isValidRefreshToken(refresh_token)) {
              api_response_error(
                res,
                403,
                "Invalid refresh token, login first."
              );
              return;
            }

            // if refresh token is valid then continue to generate new access token
            const user = await prisma.user.findUnique({
              where: { id: decoded.id },
            });
            if (!user) {
              api_response_error(res, 403, "Invalid refresh token");
              return;
            }
            const new_access_token = generateAccessToken(user);

            res.cookie("access_token", new_access_token, {
              httpOnly: true,
              secure: true,
              sameSite: "none",
            });
          }
          api_response_error(res, 403, "Invalid access token");
          return;
        }
        req.user = decoded;
        next();
      }
    );
  } catch (error) {
    api_response_error(res, 401, "Unauthorized to access.");
    return;
  }
};

const isValidRefreshToken = (refresh_token: string): boolean => {
  try {
    const refresh_token_secret =
      process.env.REFRESH_TOKEN_SECRET! ||
      "30b7f112be7f9ee0b578544b31c40a04d1ded591632b0dff8884785fe6765af7";
    jwt.verify(
      refresh_token,
      refresh_token_secret,
      (err: any, decoded: any) => {
        if (err) return false;
      }
    );
    return true;
  } catch (error) {
    return false;
  }
};

export default verifyAccessToken;
