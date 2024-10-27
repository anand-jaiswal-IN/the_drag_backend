import { Request, Response } from "express";

const home_page = (req: Request, res: Response) => {
  res.json("Home page");
};

const about_page = (req: Request, res: Response) => {
  res.json("About page");
};

export { home_page, about_page };
