import { Pagination, RecordDates } from "@/types/common.types";

export enum OrderStatus {
  PROCESSING = "PROCESSING",
  CANCELED = "CANCELED",
  CONFIRMED = "CONFIRMED",
  REFUNDED = "REFUNDED",
}

export type TOrderItem = {
  productBarcode: string;
  quantity: number;
  price: number;
  expirationDate: number;
};

export type TOrder = RecordDates & {
  orderId: string;
  storeId: string;
  totalPrice: number;
  status: OrderStatus;
  purchaseDate: number;
  items: TOrderItem[];
};

export type CreateOrderDTO = Omit<
  TOrder,
  keyof RecordDates | "orderId" | "purchaseDate"
>;

export type UpdateOrderDTO = Partial<{
  status: OrderStatus;
}>;

export type FilterOrdersDTO = Pagination &
  Partial<{
    barcode: string;
    status: OrderStatus;
    totalPriceFrom: number;
    totalPriceTo: number;
    purchaseDateFrom: number;
    purchaseDateTo: number;
  }>;
