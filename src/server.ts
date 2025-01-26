import express, { Application, Router } from "express";
import cors from "cors";
import helmet from "helmet";
import xss from "x-xss-protection";
import rateLimit from "express-rate-limit";
import { globalErrorHandler } from "@/middlewares/error.middleware";
import { NotFound } from "@/helpers/exceptions";

export class ExpServer {
  private _app: Application;

  constructor() {
    this._app = express();
    this._setMiddlewares();
  }

  private _setMiddlewares() {
    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: true }));
    this._app.use(
      cors({
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTION"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );
    this._app.use(helmet());
    this._app.use(xss());

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    });
    this._app.use(limiter);
  }

  registerRootRoute(rootRouter: Router) {
    this._app.use("/api/v1", rootRouter);
    this._app.all("*", (req) => {
      // to prevent logging error when the browser looks for favicon
      if (!req.originalUrl.includes("/favicon.ico"))
        throw new NotFound(`this path [${req.originalUrl}] does not exist!`);
    });
    this._app.use(globalErrorHandler);
  }

  listen() {
    this._app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  }
}
