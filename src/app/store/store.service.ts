import { List, Nullable } from "@/types/common.types";
import {
  CreateStoreDTO,
  FilterStoresDTO,
  TStore,
  UpdateStoreDTO,
} from "./store.types";
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  or,
  query,
  QueryFilterConstraint,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/core/firestore";

export class StoreService {
  private _storeCollection: CollectionReference;

  constructor() {
    this._storeCollection = collection(db, "stores");
  }
  async fetch(storeId: string): Promise<Nullable<TStore>> {
    const storeRef = doc(db, this._storeCollection.path, storeId);
    const docSnap = await getDoc(storeRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    data.storeId = storeId;
    data.createdAt = data.createdAt.seconds;
    data.updatedAt = data.updatedAt.seconds;

    return data as TStore;
  }
  async list(filter?: FilterStoresDTO): Promise<List<TStore>> {
    const filters: QueryFilterConstraint[] = [];

    if (filter?.name) {
      filters.push(where("name", "==", filter.name));
    }

    if (filter?.address) {
      filters.push(where("address", "==", filter.address));
    }

    if (filter?.email) {
      filters.push(where("email", "==", filter.email));
    }

    if (filter?.phone) {
      filters.push(where("phone", "==", filter.phone));
    }
    if (filter?.city) {
      filters.push(where("city", "==", filter.city));
    }
    if (filter?.country) {
      filters.push(where("country", "==", filter.country));
    }

    const q = query(this._storeCollection, or(...filters));

    const querySnapshot = await getDocs(q);

    return {
      total: querySnapshot.size,
      items: querySnapshot.docs.map((pDoc) => ({
        ...pDoc.data(),
        storeId: pDoc.id,
        createdAt: pDoc.data().createdAt.seconds,
        updatedAt: pDoc.data().updatedAt.seconds,
      })) as TStore[],
    };
  }
  async create(payload: CreateStoreDTO): Promise<TStore> {
    const data = {
      ...payload,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    const created = await addDoc(this._storeCollection, data);

    return {
      ...data,
      storeId: created.id,
      createdAt: data.createdAt.seconds,
      updatedAt: data.updatedAt.seconds,
    };
  }
  async update(
    storeId: string,
    payload: UpdateStoreDTO
  ): Promise<Nullable<TStore>> {
    const storeRef = doc(db, this._storeCollection.path, storeId);
    const docSnap = await getDoc(storeRef);

    if (!docSnap.exists()) return null;

    const existing = docSnap.data();

    const data = {
      ...existing,
      ...payload,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    await updateDoc(storeRef, data);

    return {
      ...data,
      storeId,
      updatedAt: data.updatedAt.seconds,
      createdAt: existing.createdAt.seconds,
    } as TStore;
  }
  async delete(storeId: string): Promise<void> {
    const storeRef = doc(db, this._storeCollection.path, storeId);
    const docSnap = await getDoc(storeRef);

    if (docSnap.exists()) {
      await deleteDoc(storeRef);
    }
  }
}
