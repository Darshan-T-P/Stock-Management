import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { adjustProductStock } from "./stockUtils";

export async function ensureProductAndAdjustStock(storeId, product) {
  if (!storeId) throw new Error("Store ID is required");
  if (!product.id) throw new Error(`Missing product ID for product: ${product.name}`);

  const productRef = doc(db, "stores", storeId, "products", product.id);

  const productSnap = await getDoc(productRef);
  if (!productSnap.exists()) {
    await setDoc(productRef, {
      name: product.name,
      stock: product.quantity || 0,
      amountBought: product.quantity || 0,
      amountSold: 0,
      price: product.price,
      supplier: product.supplier || null,
      createdAt: new Date(),
    });
  }

  // Adjust stock after ensuring existence
  await adjustProductStock(
    storeId,
    product.id,
    product.quantity,
    {
      amountBought: (product.amountBought || 0) + (product.quantity || 0),
      price: product.price,
      ...(product.supplier ? { supplier: product.supplier } : {}),
    }
  );
}
