export type Range<T> = {
  from: T;
  to: T;
};

export type NumberRange = Range<number>;

export type DateRange = Range<Date>;

export type Pagination = {
  take?: number;
  skip?: number;
};

export type RecordDates = {
  createdAt: number;
  updatedAt: number;
};

export type Nullable<T> = T | null;

export type List<T> = {
  items: T[];
  total: number;
};
