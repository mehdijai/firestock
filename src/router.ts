import { Router } from "express";
import HttpStatusCode from "@/helpers/HTTPStatusCodes";
import productsRouter from "@/app/product/product.router";
import storesRouter from "@/app/store/store.router";
import stockRouter from "@/app/stock/stock.router";
import ordersRouter from "@/app/order/order.router";

const rootRouter = Router();

rootRouter.get("/", (_, res) => {
  res
    .json({
      status: "RUNNING",
      mode: process.env.NODE_ENV === "production" ? "prod" : "dev",
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    .status(HttpStatusCode.OK);
});

rootRouter.use("/products", productsRouter);
rootRouter.use("/stores", storesRouter);
rootRouter.use("/stocks", stockRouter);
rootRouter.use("/orders", ordersRouter);

export default rootRouter;
