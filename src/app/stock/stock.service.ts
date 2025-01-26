import { List, Nullable } from "@/types/common.types";
import {
  CreateStockItemDTO,
  ExpiredProductsCheckDTO,
  FilterStockItemsDTO,
  ItemExpiration,
  TExpirations,
  TStockItem,
  UpdateStockItemDTO,
} from "./stock.types";
import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  query,
  getDocs,
  or,
  QueryFilterConstraint,
} from "firebase/firestore";
import { db } from "@/core/firestore";
import { filterRange } from "@/helpers/range-filters";

export class StockService {
  private _stockCollection: CollectionReference;

  constructor() {
    this._stockCollection = collection(db, "stocks");
  }

  async fetch(barcode: string): Promise<Nullable<TStockItem>> {
    const stockRef = doc(db, this._stockCollection.path, barcode);
    const docSnap = await getDoc(stockRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    data.barcode = barcode;
    data.createdAt = data.createdAt.seconds;
    data.updatedAt = data.updatedAt.seconds;

    return data as TStockItem;
  }
  async list(filter?: FilterStockItemsDTO): Promise<List<TStockItem>> {
    const filters: QueryFilterConstraint[] = [];

    if (filter?.storeId) {
      filters.push(where("storeId", "==", filter.storeId));
    }

    filters.push(
      ...filterRange("quantity", filter?.quantityFrom, filter?.quantityTo)
    );
    filters.push(
      ...filterRange(
        "reservedQuantity",
        filter?.reservedQuantityFrom,
        filter?.reservedQuantityTo
      )
    );
    filters.push(
      ...filterRange(
        "expirations",
        filter?.expirationsFrom,
        filter?.expirationsTo
      )
    );

    const q = query(this._stockCollection, or(...filters));

    const querySnapshot = await getDocs(q);

    return {
      total: querySnapshot.size,
      items: querySnapshot.docs.map((pDoc) => ({
        ...pDoc.data(),
        barcode: pDoc.id,
        createdAt: pDoc.data().createdAt.seconds,
        updatedAt: pDoc.data().updatedAt.seconds,
      })) as TStockItem[],
    };
  }
  async create({
    barcode,
    ...payload
  }: CreateStockItemDTO): Promise<TStockItem> {
    const data = {
      ...payload,
      soonestExpirationDate: Math.min(
        ...payload.expirations.map((p) => p.date)
      ),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    await setDoc(doc(db, this._stockCollection.path, barcode), data);

    return {
      ...data,
      barcode,
      createdAt: data.createdAt.seconds,
      updatedAt: data.updatedAt.seconds,
    };
  }
  async update(
    barcode: string,
    payload: UpdateStockItemDTO
  ): Promise<Nullable<TStockItem>> {
    const stockRef = doc(db, this._stockCollection.path, barcode);
    const docSnap = await getDoc(stockRef);

    if (!docSnap.exists()) return null;

    const existing = docSnap.data();

    const data: any = {
      ...payload,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (payload.expirations) {
      data.soonestExpirationDate = Math.min(
        ...payload.expirations.map((p) => p.date)
      );
    }

    await updateDoc(stockRef, data);

    return {
      ...data,
      barcode,
      updatedAt: data.updatedAt.seconds,
      createdAt: existing.createdAt.seconds,
    } as TStockItem;
  }

  async delete(barcode: string): Promise<void> {
    const stockRef = doc(db, this._stockCollection.path, barcode);
    const docSnap = await getDoc(stockRef);

    if (docSnap.exists()) {
      await deleteDoc(stockRef);
    }
  }

  async checkExpiredProducts(
    storeId: string,
    payload: ExpiredProductsCheckDTO
  ): Promise<TExpirations[]> {
    const toleranceDays = payload.toleranceDays ?? 0;

    const today = new Date().getTime() + toleranceDays * 24 * 60 * 60 * 1000;

    const q = query(
      this._stockCollection,
      where("storeId", "==", storeId),
      where("soonestExpirationDate", "<=", today)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((pDoc) => {
      return {
        barcode: pDoc.id,
        date: pDoc.data().soonestExpirationDate,
        quantity: pDoc
          .data()
          .expirations.find(
            (i: ItemExpiration) => i.date === pDoc.data().soonestExpirationDate
          ).quantity,
      };
    });
  }
}
