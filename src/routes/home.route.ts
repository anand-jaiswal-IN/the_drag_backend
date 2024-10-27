import { home_page, about_page } from "../controllers/index.controller";
import { Router } from "express";

const router = Router();

router.get("/", home_page);

router.get("/about", about_page);

export default router;
