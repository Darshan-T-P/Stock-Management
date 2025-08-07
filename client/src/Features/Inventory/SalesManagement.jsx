import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";

export default function SalesManagement() {
  const { profile } = useAuth();

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  // Form state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantitySold, setQuantitySold] = useState("");
  const [salePrice, setSalePrice] = useState(""); // per unit sale price (optional override)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch products on load or store change
  useEffect(() => {
    if (!profile?.storeId) return;

    const fetchProducts = async () => {
      try {
        const productsCol = collection(
          db,
          "stores",
          profile.storeId,
          "products"
        );
        const snapshot = await getDocs(productsCol);
        setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, [profile?.storeId]);

  // Fetch sales history on load or store change
  useEffect(() => {
    if (!profile?.storeId) return;

    const fetchSales = async () => {
      try {
        const salesCol = collection(db, "stores", profile.storeId, "sales");
        const snapshot = await getDocs(salesCol);
        setSales(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Failed to fetch sales:", err);
      }
    };

    fetchSales();
  }, [profile?.storeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedProductId) {
      setError("Please select a product.");
      return;
    }
    if (!quantitySold || Number(quantitySold) <= 0) {
      setError("Enter a valid quantity sold.");
      return;
    }
    if (salePrice && Number(salePrice) <= 0) {
      setError("Sale price must be positive or empty.");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      setError("Selected product not found.");
      return;
    }
    if (Number(quantitySold) > product.stock) {
      setError(`Not enough stock. Available: ${product.stock}`);
      return;
    }

    setLoading(true);
    try {
      const perUnitPrice = salePrice ? Number(salePrice) : product.price;
      const finalSalePrice = perUnitPrice * Number(quantitySold);

      // Add sale doc to Firestore
      const salesCol = collection(db, "stores", profile.storeId, "sales");
      await addDoc(salesCol, {
        productId: product.id,
        productName: product.name,
        quantitySold: Number(quantitySold),
        unitPrice: perUnitPrice,
        salePrice: finalSalePrice,
        timestamp: serverTimestamp(),
      });

      // Update product stock
      const productDoc = doc(db, "stores", profile.storeId, "products", product.id);
      await updateDoc(productDoc, {
        stock: product.stock - Number(quantitySold),
      });

      // Reset form state
      setSelectedProductId("");
      setQuantitySold("");
      setSalePrice("");
      setError("");

      // Refresh products & sales data from Firestore
      const updatedProductsSnap = await getDocs(
        collection(db, "stores", profile.storeId, "products")
      );
      setProducts(updatedProductsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const updatedSalesSnap = await getDocs(
        collection(db, "stores", profile.storeId, "sales")
      );
      setSales(updatedSalesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Sales Management</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          required
          className="border p-2 rounded"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (Stock: {p.stock})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity Sold"
          min="1"
          value={quantitySold}
          onChange={(e) => setQuantitySold(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <input
          type="number"
          placeholder="Sale Price per unit (optional)"
          min="0"
          step="0.01"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Recording..." : "Record Sale"}
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <h3 className="text-xl font-semibold mb-2">Recent Sales</h3>

      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Product</th>
            <th className="border border-gray-300 px-4 py-2">Quantity Sold</th>
            <th className="border border-gray-300 px-4 py-2">Unit Price</th>
            <th className="border border-gray-300 px-4 py-2">Total Sale Price</th>
            <th className="border border-gray-300 px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 && (
            <tr>
              <td colSpan="5" className="border border-gray-300 p-4 text-center text-gray-500">
                No sales recorded.
              </td>
            </tr>
          )}
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{sale.productName}</td>
              <td className="border border-gray-300 px-4 py-2">{sale.quantitySold}</td>
              <td className="border border-gray-300 px-4 py-2">
                ₹{sale.unitPrice?.toLocaleString("en-IN")}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                ₹{sale.salePrice?.toLocaleString("en-IN")}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {sale.timestamp?.toDate ? sale.timestamp.toDate().toLocaleString() : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
