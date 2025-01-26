import { Pagination, RecordDates } from "@/types/common.types";

export type ItemExpiration = {
  date: number; // timestamp
  quantity: number;
};

export type TStockItem = RecordDates & {
  barcode: string;
  storeId: string;
  expirations: ItemExpiration[];
  soonestExpirationDate: number;
  quantity: number;
  reservedQuantity: number;
};

export type CreateStockItemDTO = Omit<
  TStockItem,
  keyof RecordDates | "soonestExpirationDate"
>;

export type UpdateStockItemDTO = Partial<CreateStockItemDTO>;

export type FilterStockItemsDTO = Pagination &
  Partial<{
    storeId: string;
    quantityFrom: number;
    quantityTo: number;
    reservedQuantityFrom: number;
    reservedQuantityTo: number;
    expirationsFrom: number;
    expirationsTo: number;
  }>;

export type ExpiredProductsCheckDTO = {
  toleranceDays?: number;
};

export type TExpirations = {
  barcode: string;
  date: number;
  quantity: number;
};

export type UpdateStockQuantityDTO = {
  quantity: number;
  type: "in" | "out"; // can be used as well for inventory tracking
};
