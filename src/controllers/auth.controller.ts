import { Request, Response } from "express";
import prisma from "../db/prisma";
import bcrypt from "bcrypt";
import {
  api_success_response,
  api_response_error,
} from "../helpers/api_response";
import jwt from "jsonwebtoken";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstname, lastname } = req.body;

    // Validate input data
    if (!email || !password) {
      api_response_error(res, 400, "Email and password are required");
      return;
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
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
        firstname,
        lastname,
      },
    });

    // Send a success response
    const newUserResponse = {
      id: newUser.id,
      email: newUser.email,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
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
    const { email, password } = req.body;

    // Validate input data
    if (!email || !password) {
      api_response_error(res, 400, "Email and password are required");
      return;
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { email } });
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

    // Generate a JWT token
    const payload = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    };
    const secret =
      process.env.SECRET_KEY ||
      "xmu0$v6lnk9xt7%^6pfbs67cv7(h%^_*^xbc@(3071m6x)=)ol";
    const token = jwt.sign(payload, secret, { expiresIn: "1d" });
    res.cookie("token", token, {
      maxAge: 60 * 60 * 24 * 1000,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    // Send a success response
    api_success_response(res, 200, "User logged in successfully");
  } catch (error) {
    api_response_error(res, 500, "Internal server error : " + error);
  }
};

const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token");
    api_success_response(res, 200, "User logged out successfully");
  } catch (error) {
    api_response_error(res, 500, "Internal server error : " + error);
  }
};

export { register, login, logout };
