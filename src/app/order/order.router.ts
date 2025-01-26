import { ApiResponse } from "@/types/app.types";
import { List, Nullable } from "@/types/common.types";
import { Request, Router } from "express";
import { TOrder } from "./order.types";
import { OrderService } from "./order.service";
import HttpStatusCode from "@/helpers/HTTPStatusCodes";

const ordersRouter = Router();

const _orderService = new OrderService();

ordersRouter.get("/", async (req: Request, res) => {
  const filter = req.query;
  const result = await _orderService.list(filter);

  const response: ApiResponse<List<TOrder>> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

ordersRouter.get("/:orderId", async (req: Request, res) => {
  const orderId = req.params.orderId;
  const result = await _orderService.fetch(orderId);

  const response: ApiResponse<Nullable<TOrder>> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

ordersRouter.post("/", async (req: Request, res) => {
  const payload = req.body;
  const result = await _orderService.create(payload);

  const response: ApiResponse<TOrder> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

ordersRouter.patch("/:orderId", async (req: Request, res) => {
  const orderId = req.params.orderId;
  const payload = req.body;
  const result = await _orderService.update(orderId, payload);

  const response: ApiResponse<TOrder> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

ordersRouter.post("/:orderId/refund", async (req: Request, res) => {
  const orderId = req.params.orderId;
  const result = await _orderService.refund(orderId);

  const response: ApiResponse<Nullable<TOrder>> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

ordersRouter.delete("/:orderId", async (req: Request, res) => {
  const orderId = req.params.orderId;
  await _orderService.delete(orderId);

  res.status(HttpStatusCode.NO_CONTENT).send({});
});

export default ordersRouter;
