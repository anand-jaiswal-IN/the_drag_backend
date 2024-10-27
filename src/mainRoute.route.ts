// mainRoute.ts
import { Application, Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { homeRouter, authRouter, userRouter } from "./routes/index.route";
import verifyJWTToken from "./middlewares/verify_jwt.middleware";

class MainRouter {
  constructor(private app: Application) {}

  public initializeRoutes() {
    this.app.use("/auth", authRouter);
    this.app.use(verifyJWTToken);
    this.app.use("/", homeRouter);
    this.app.use("/user", userRouter);
    this.app.use(this.notFoundHandler);
    this.app.use(this.errorHandler);
  }

  private notFoundHandler(req: Request, res: Response, next: NextFunction) {
    next(createError(404));
  }

  private errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.json({
      error: req.app.get("env") === "development" ? err : {},
    });
  }
}

export default MainRouter;
