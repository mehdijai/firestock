import { Nullable, Pagination, RecordDates } from "@/types/common.types";

export type TProduct = RecordDates & {
  barcode: string;
  name: string;
  description: Nullable<string>;
  basePrice: number;
  manufacturer: Nullable<string>;
};

export type CreateProductDTO = Omit<TProduct, keyof RecordDates>;

export type UpdateProductDTO = Partial<Omit<CreateProductDTO, "barcode">>;

export type FilterProductsDTO = Pagination &
  Partial<{
    name: string;
    basePriceFrom: number;
    basePriceTo: number;
    manufacturer: string;
  }>;
