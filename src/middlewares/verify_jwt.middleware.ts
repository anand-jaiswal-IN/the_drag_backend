import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { api_response_error } from "../helpers/api_response";

const verifyJWTToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.token;
  if (!token) {
    api_response_error(res, 401, "Unauthorized to access.");
    return;
  }
  try {
    const secret =
      process.env.SECRET_KEY ||
      "xmu0$v6lnk9xt7%^6pfbs67cv7(h%^_*^xbc@(3071m6x)=)ol";
    jwt.verify(token, secret, (err: any, decoded: any) => {
      if (err) {
        api_response_error(res, 401, "Unauthorized to access.");
        return;
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    api_response_error(res, 401, "Unauthorized to access.");
    return;
  }
};

export default verifyJWTToken;
