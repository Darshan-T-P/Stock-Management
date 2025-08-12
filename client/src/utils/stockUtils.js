// src/utils/stockUtils.js
import { runTransaction, doc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Adjust stock atomically and safely.
 * @param {string} storeId Firestore store document ID
 * @param {string} productId Firestore product document ID
 * @param {number} changeQty Positive to add stock, negative to remove
 * @param {object} extraFields Optional extra fields to update
 */
export async function adjustProductStock(storeId, productId, changeQty, extraFields = {}) {
  const productRef = doc(db, "stores", storeId, "products", productId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(productRef);
    if (!snap.exists()) throw new Error("Product not found");
    const data = snap.data();
    const currentStock = data.stock || 0;

    // Clamp to >= 0
    const newStock = Math.max(currentStock + changeQty, 0);

    // If selling, make sure stock is sufficient
    if (changeQty < 0 && currentStock < Math.abs(changeQty)) {
      throw new Error(`Insufficient stock for ${data.name}`);
    }

    tx.update(productRef, {
      stock: newStock,
      ...extraFields
    });
  });
}
