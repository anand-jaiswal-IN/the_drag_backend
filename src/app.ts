import express from "express";
import path from "path";
import logger from "morgan";
import cookieParser from "cookie-parser";
import MainRouter from "./mainRoute";

const app = express();

// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Initialize and use the MainRouter
const mainRouter = new MainRouter(app);
mainRouter.initializeRoutes();

/*
app.use("/auth", authRouter);
app.use(verifyJWTToken);
app.use("/", homeRouter);
*/
export default app;
