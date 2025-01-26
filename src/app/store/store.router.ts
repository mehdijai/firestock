import { Request, Router } from "express";
import { StoreService } from "./store.service";
import { TStore } from "./store.types";
import { List, Nullable } from "@/types/common.types";
import { ApiResponse } from "@/types/app.types";
import HttpStatusCode from "@/helpers/HTTPStatusCodes";

const storesRouter = Router();

const _storeService = new StoreService();

storesRouter.get("/", async (req: Request, res) => {
  const filter = req.query;
  const result = await _storeService.list(filter);

  const response: ApiResponse<List<TStore>> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

storesRouter.get("/:storeId", async (req: Request, res) => {
  const storeId = req.params.storeId;
  const result = await _storeService.fetch(storeId);

  const response: ApiResponse<Nullable<TStore>> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

storesRouter.post("/", async (req: Request, res) => {
  const payload = req.body;
  const result = await _storeService.create(payload);

  const response: ApiResponse<TStore> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

storesRouter.patch("/:storeId", async (req: Request, res) => {
  const storeId = req.params.storeId;
  const payload = req.body;
  const result = await _storeService.update(storeId, payload);

  const response: ApiResponse<Nullable<TStore>> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

storesRouter.delete("/:storeId", async (req: Request, res) => {
  const storeId = req.params.storeId;
  await _storeService.delete(storeId);

  res.status(HttpStatusCode.NO_CONTENT).send({});
});

export default storesRouter;
