import { Request, Response } from "express";
import prisma from "../db/prisma";
import bcrypt from "bcrypt";
import {
  api_success_response,
  api_response_error,
} from "../helpers/api_response";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../helpers/generate_auth_token";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    // Validate input data
    if (!email || !username || !password) {
      api_response_error(res, 400, "email, username and password are required");
      return;
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findMany({
      where: { OR: [{ email: email }, { username: username }] },
    });
    if (existingUser.length > 0) {
      api_response_error(res, 409, "User already exists");
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    // Send a success response
    const newUserResponse = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      haveProfile: newUser.haveProfile,
      isStaff: newUser.isStaff,
    };
    api_success_response(
      res,
      201,
      "User created successfully",
      newUserResponse
    );
  } catch (error) {
    api_response_error(res, 500, "Internal server errorc : " + error);
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_identifier, password } = req.body;

    // Validate input data
    if (!user_identifier || !password) {
      api_response_error(res, 400, "email/username and password are required");
      return;
    }

    // Check if the user present in the database by finding with username
    let user = await prisma.user.findUnique({
      where: {
        username: user_identifier,
      },
    });

    // Check if the user present in the database by finding with email
    if (!user) {
      user = await prisma.user.findUnique({
        where: {
          email: user_identifier,
        },
      });
    }

    if (!user) {
      api_response_error(res, 401, "Invalid email or password");
      return;
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      api_response_error(res, 401, "Invalid email or password");
      return;
    }

    // Delete old access token and refresh token and set new one
    await prisma.accessToken.deleteMany({
      where: {
        userId: user.id,
      },
    });
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Generating access and refresh tokens
    const access_token = generateAccessToken(user);
    await prisma.accessToken.create({
      data: {
        token: access_token,
        userId: user.id,
      },
    });

    const refresh_token = generateRefreshToken(user);
    await prisma.refreshToken.create({
      data: {
        token: refresh_token,
        userId: user.id,
      },
    });

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Sending success response
    api_success_response(res, 200, "login tokens generated", {
      access_token,
      refresh_token,
    });
  } catch (error) {
    api_response_error(res, 500, "Internal server error : " + error);
  }
};

const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    req.user = null;
    api_success_response(res, 200, "User logged out successfully");
  } catch (error) {
    api_response_error(res, 500, "Internal server error : " + error);
  }
};

export { register, login, logout };
