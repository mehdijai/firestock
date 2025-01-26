import { ApiResponse } from "@/types/app.types";
import { List, Nullable } from "@/types/common.types";
import { Request, Router } from "express";
import { ExpiredProductsCheckDTO, TExpirations, TStockItem } from "./stock.types";
import HttpStatusCode from "@/helpers/HTTPStatusCodes";
import { StockService } from "./stock.service";

const stockRouter = Router();

const _stockService = new StockService();

stockRouter.get("/", async (req: Request, res) => {
  const filter = req.query;
  const result = await _stockService.list(filter);

  const response: ApiResponse<List<TStockItem>> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

stockRouter.get("/:storeId/expired", async (req: Request, res) => {
  const storeId = req.params.storeId;
  const payload: ExpiredProductsCheckDTO = req.query;
  const result = await _stockService.checkExpiredProducts(storeId, payload);

  const response: ApiResponse<TExpirations[]> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

stockRouter.get("/:stockId", async (req: Request, res) => {
  const stockId = req.params.stockId;
  const result = await _stockService.fetch(stockId);

  const response: ApiResponse<Nullable<TStockItem>> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

stockRouter.post("/", async (req: Request, res) => {
  const payload = req.body;
  const result = await _stockService.create(payload);

  const response: ApiResponse<TStockItem> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

stockRouter.patch("/:stockId", async (req: Request, res) => {
  const stockId = req.params.stockId;
  const payload = req.body;
  const result = await _stockService.update(stockId, payload);

  const response: ApiResponse<Nullable<TStockItem>> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

stockRouter.delete("/:stockId", async (req: Request, res) => {
  const stockId = req.params.stockId;
  await _stockService.delete(stockId);

  res.status(HttpStatusCode.NO_CONTENT).send({});
});

export default stockRouter;
