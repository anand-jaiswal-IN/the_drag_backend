// @types/express/index.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: null | {
        id: number;
        email: string;
        firstname: string;
        lastname: string;
      };
    }
  }
}
