import { List, Nullable } from "@/types/common.types";
import {
  CreateProductDTO,
  FilterProductsDTO,
  TProduct,
  UpdateProductDTO,
} from "./product.types";
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

export class ProductService {
  private _productCollection: CollectionReference;

  constructor() {
    this._productCollection = collection(db, "products");
  }

  async fetch(barcode: string): Promise<Nullable<TProduct>> {
    const productRef = doc(db, this._productCollection.path, barcode);
    const docSnap = await getDoc(productRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    data.barcode = barcode;
    data.createdAt = data.createdAt.seconds;
    data.updatedAt = data.updatedAt.seconds;

    return data as TProduct;
  }

  async list(filter?: FilterProductsDTO): Promise<List<TProduct>> {
    const filters: QueryFilterConstraint[] = [];

    if (filter?.name) {
      filters.push(where("name", "==", filter.name));
    }

    if (filter?.manufacturer) {
      filters.push(where("manufacturer", "==", filter.manufacturer));
    }

    filters.push(
      ...filterRange("basePrice", filter?.basePriceFrom, filter?.basePriceTo)
    );

    const q = query(this._productCollection, or(...filters));

    const querySnapshot = await getDocs(q);

    return {
      total: querySnapshot.size,
      items: querySnapshot.docs.map((pDoc) => ({
        ...pDoc.data(),
        barcode: pDoc.id,
        createdAt: pDoc.data().createdAt.seconds,
        updatedAt: pDoc.data().updatedAt.seconds,
      })) as TProduct[],
    };
  }

  async create({ barcode, ...payload }: CreateProductDTO): Promise<TProduct> {
    const data = {
      ...payload,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    await setDoc(doc(db, this._productCollection.path, barcode), data);

    return {
      ...data,
      barcode,
      createdAt: data.createdAt.seconds,
      updatedAt: data.updatedAt.seconds,
    };
  }
  async update(
    barcode: string,
    payload: UpdateProductDTO
  ): Promise<Nullable<TProduct>> {
    const productRef = doc(db, this._productCollection.path, barcode);
    const docSnap = await getDoc(productRef);

    if (!docSnap.exists()) return null;

    const existing = docSnap.data();

    const data = {
      ...existing,
      ...payload,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    await updateDoc(productRef, data);

    return {
      ...data,
      barcode,
      updatedAt: data.updatedAt.seconds,
      createdAt: existing.createdAt.seconds,
    } as TProduct;
  }
  async delete(barcode: string): Promise<void> {
    const productRef = doc(db, this._productCollection.path, barcode);
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
      await deleteDoc(productRef);
    }
  }
}
