import { List, Nullable } from "@/types/common.types";
import {
  CreateOrderDTO,
  FilterOrdersDTO,
  OrderStatus,
  TOrder,
  TOrderItem,
  UpdateOrderDTO,
} from "./order.types";
import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getDoc,
  Timestamp,
  updateDoc,
  where,
  query,
  getDocs,
  or,
  QueryFilterConstraint,
  addDoc,
} from "firebase/firestore";
import { db } from "@/core/firestore";
import { filterRange } from "@/helpers/range-filters";
import { ItemExpiration } from "@/app/stock/stock.types";

export class OrderService {
  private _orderCollection: CollectionReference;

  constructor() {
    this._orderCollection = collection(db, "orders");
  }

  async fetch(orderId: string): Promise<Nullable<TOrder>> {
    const stockRef = doc(db, this._orderCollection.path, orderId);
    const docSnap = await getDoc(stockRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    data.orderId = orderId;
    data.createdAt = data.createdAt.seconds;
    data.updatedAt = data.updatedAt.seconds;

    return data as TOrder;
  }

  async list(filter?: FilterOrdersDTO): Promise<List<TOrder>> {
    const filters: QueryFilterConstraint[] = [];

    if (filter?.status) {
      filters.push(where("status", "==", filter.status));
    }

    filters.push(
      ...filterRange("totalPrice", filter?.totalPriceFrom, filter?.totalPriceTo)
    );
    filters.push(
      ...filterRange(
        "purchaseDate",
        filter?.purchaseDateFrom,
        filter?.purchaseDateTo
      )
    );

    const q = query(this._orderCollection, or(...filters));

    const querySnapshot = await getDocs(q);

    return {
      total: querySnapshot.size,
      items: querySnapshot.docs.map((pDoc) => ({
        ...pDoc.data(),
        orderId: pDoc.id,
        createdAt: pDoc.data().createdAt.seconds,
        updatedAt: pDoc.data().updatedAt.seconds,
      })) as TOrder[],
    };
  }

  async create(payload: CreateOrderDTO): Promise<TOrder> {
    const data: any = {
      ...payload,
      purchaseDate: null,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (payload.status === OrderStatus.CONFIRMED) {
      data.purchaseDate = new Date().getTime();
    }

    const created = await addDoc(this._orderCollection, data);

    const orderItems: TOrderItem[] = payload.items;

    await this._updateStock(orderItems, "out");

    return {
      ...data,
      orderId: created.id,
      createdAt: data.createdAt.seconds,
      updatedAt: data.updatedAt.seconds,
    };
  }
  async update(
    orderId: string,
    payload: UpdateOrderDTO
  ): Promise<Nullable<TOrder>> {
    const orderRef = doc(db, this._orderCollection.path, orderId);
    const docSnap = await getDoc(orderRef);

    if (!docSnap.exists()) return null;

    const existing = docSnap.data();

    const data: any = {
      status: payload.status,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (
      existing.purchaseDate === null &&
      payload.status === OrderStatus.CONFIRMED
    ) {
      data.purchaseDate = new Date().getTime();
    }

    await updateDoc(orderRef, data);

    return {
      ...existing,
      ...data,
      orderId,
      updatedAt: data.updatedAt.seconds,
      createdAt: existing.createdAt.seconds,
    } as TOrder;
  }

  async refund(orderId: string): Promise<Nullable<TOrder>> {
    const orderRef = doc(db, this._orderCollection.path, orderId);
    const orderDocSnap = await getDoc(orderRef);

    if (!orderDocSnap.exists()) return null;

    const data: any = {
      status: OrderStatus.REFUNDED,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    // Update order
    await updateDoc(orderRef, data);

    // Update Stock
    const orderItems: TOrderItem[] = orderDocSnap.data().items;

    await this._updateStock(orderItems, "in");

    const existing = orderDocSnap.data();

    return {
      ...existing,
      ...data,
      orderId,
      updatedAt: data.updatedAt.seconds,
      createdAt: existing.createdAt.seconds,
    } as TOrder;
  }

  async delete(orderId: string): Promise<void> {
    const orderRef = doc(db, this._orderCollection.path, orderId);
    const docSnap = await getDoc(orderRef);

    if (docSnap.exists()) {
      await deleteDoc(orderRef);
    }
  }

  private async _updateStock(items: TOrderItem[], type: "in" | "out") {
    for (const item of items) {
      const stockCollection = collection(db, "stocks");
      const stockRef = doc(db, stockCollection.path, item.productBarcode);
      const stockDocSnap = await getDoc(stockRef);

      if (!stockDocSnap.exists()) continue;

      const stockInstance = stockDocSnap.data();

      const newQuantity =
        stockInstance.quantity + (type === "in" ? 1 : -1) * item.quantity;

      const expirations: ItemExpiration[] = structuredClone(
        stockInstance.expirations
      );

      const matchExpiration = expirations.find(
        (i: ItemExpiration) => i.date === item.expirationDate
      );

      if (matchExpiration) {
        matchExpiration.quantity += (type === "in" ? 1 : -1) * item.quantity;
      } else {
        expirations.push({
          date: item.expirationDate,
          quantity: item.quantity,
        });
      }

      const soonestExpirationDate = Math.min(...expirations.map((p) => p.date));

      const data: any = {
        quantity: newQuantity,
        expirations,
        soonestExpirationDate,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(stockRef, data);
    }
  }
}
