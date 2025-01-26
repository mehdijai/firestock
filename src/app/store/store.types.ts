import { Pagination, RecordDates } from "@/types/common.types";

export type TStore = RecordDates & {
  storeId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phone: string;
};

export type CreateStoreDTO = Omit<TStore, keyof RecordDates | "storeId">;

export type UpdateStoreDTO = Partial<CreateStoreDTO>;

export type FilterStoresDTO = Pagination &
  Partial<{
    name: string;
    address: string;
    city: string;
    country: string;
    email: string;
    phone: string;
  }>;
