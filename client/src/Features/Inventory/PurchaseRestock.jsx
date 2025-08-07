import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";

export default function PurchaseRestock() {
  const { profile } = useAuth(); // contains storeId
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile?.storeId) return;

    const fetchProducts = async () => {
      const productsCol = collection(db, "stores", profile.storeId, "products");
      const snapshot = await getDocs(productsCol);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchProducts();
  }, [profile?.storeId]);

  const handleRestock = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!selectedProductId || !quantity || Number(quantity) <= 0) {
      setMessage("Please select a product and enter a valid quantity.");
      return;
    }

    setLoading(true);
    try {
      // Reference to the product doc
      const productRef = doc(db, "stores", profile.storeId, "products", selectedProductId);

      // Fetch current stock
      const productSnap = await getDocs(collection(db, "stores", profile.storeId, "products"));
      // Alternatively you can read from local products state

      // Update stock by adding quantity
      const product = products.find(p => p.id === selectedProductId);
      const newStock = (product.stock || 0) + Number(quantity);

      // Update Firestore
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: serverTimestamp(),
      });

      // Optionally add a purchase record
      await addDoc(collection(db, "stores", profile.storeId, "purchases"), {
        productId: selectedProductId,
        productName: product.name,
        quantity: Number(quantity),
        timestamp: serverTimestamp(),
      });

      // Update UI state
      setProducts(products.map(p => p.id === selectedProductId ? { ...p, stock: newStock } : p));
      setMessage(`Successfully restocked ${quantity} units of ${product.name}.`);
      setSelectedProductId("");
      setQuantity("");

      // Trigger email notification for restocking (covered below)
      sendRestockEmailNotification(product.name, quantity);
    } catch (error) {
      setMessage("Failed to restock: " + error.message);
    }
    setLoading(false);
  };

  // Placeholder for email notification trigger
  const sendRestockEmailNotification = async (productName, quantityAdded) => {
    // This function will be implemented in Step 2 via Firebase Cloud Functions or another service.
    // For now, you can trigger backend/email via API call or Firebase Callable Function
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Purchase / Restock Inventory</h2>

      <form onSubmit={handleRestock} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <select
          value={selectedProductId}
          onChange={e => setSelectedProductId(e.target.value)}
          required
          className="border p-2 rounded"
        >
          <option value="">Select Product</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (Stock: {p.stock})
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          placeholder="Quantity to Add"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Restocking..." : "Restock"}
        </button>
      </form>

      {message && <div className="mb-4 p-3 bg-yellow-100 text-yellow-900 rounded">{message}</div>}
    </div>
  );
}
