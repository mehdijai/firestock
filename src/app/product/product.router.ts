import { Request, Router } from "express";
import { ProductService } from "./product.service";
import { List, Nullable } from "@/types/common.types";
import { TProduct } from "./product.types";
import { ApiResponse } from "@/types/app.types";
import HttpStatusCode from "@/helpers/HTTPStatusCodes";

const productsRouter = Router();

const _productService = new ProductService();

productsRouter.get("/", async (req: Request, res) => {
  const filter = req.query;
  const result = await _productService.list(filter);

  const response: ApiResponse<List<TProduct>> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

productsRouter.get("/:productId", async (req: Request, res) => {
  const productId = req.params.productId;
  const result = await _productService.fetch(productId);

  const response: ApiResponse<Nullable<TProduct>> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

productsRouter.post("/", async (req: Request, res) => {
  const payload = req.body;
  const result = await _productService.create(payload);

  const response: ApiResponse<TProduct> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

productsRouter.patch("/:productId", async (req: Request, res) => {
  const productId = req.params.productId;
  const payload = req.body;

  const result = await _productService.update(productId, payload);

  const response: ApiResponse<Nullable<TProduct>> = {
    errors: null,
    data: result,
  };
  res.json(response).status(HttpStatusCode.OK);
});

productsRouter.delete("/:productId", async (req: Request, res) => {
  const productId = req.params.productId;

  await _productService.delete(productId);
  res.status(HttpStatusCode.NO_CONTENT).send({});
});

export default productsRouter;
