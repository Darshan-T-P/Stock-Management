import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import { sendInAppNotification } from "../../utils/notificationService";

export default function Inventory() {
  const { currentUser, profile } = useAuth();
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sellingPrices, setSellingPrices] = useState({}); // productId -> selling price

  useEffect(() => {
    if (!profile?.storeId) return;

    const fetchProducts = async () => {
      const productsCol = collection(db, "stores", profile.storeId, "products");
      const productsSnapshot = await getDocs(productsCol);
      const prods = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(prods);

      // Initialize selling prices with existing price or purchase price
      const initialPrices = {};
      prods.forEach((p) => {
        initialPrices[p.id] = p.sellingPrice ?? p.price;
      });
      setSellingPrices(initialPrices);

      // Compute low stock alerts
      const lowStockAlerts = prods.filter((p) => p.stock > 0 && p.stock < 20);
      setAlerts(lowStockAlerts);

      // Send notifications for low stock products
      if (currentUser) {
        for (const product of lowStockAlerts) {
          await sendInAppNotification(
            currentUser.uid,
            "Low Stock Alert",
            `${product.name} is running low (Stock: ${product.stock})`,
            "low-stock"
          );
        }
      }
    };

    fetchProducts();
  }, [profile, currentUser]);

  // Handle selling price change in UI
  const handlePriceChange = (productId, value) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setSellingPrices((prev) => ({
        ...prev,
        [productId]: value,
      }));
    }
  };

  // Update Firestore with new selling price on blur or Enter key press
  const updateSellingPrice = async (productId) => {
    const newPriceStr = sellingPrices[productId];
    const newPrice = parseFloat(newPriceStr);
    if (isNaN(newPrice) || newPrice < 0) {
      alert("Invalid price");
      return;
    }

    try {
      const prodRef = doc(db, "stores", profile.storeId, "products", productId);
      await updateDoc(prodRef, {
        sellingPrice: newPrice,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, sellingPrice: newPrice } : p
        )
      );
    } catch (error) {
      console.error("Failed to update selling price:", error);
      alert("Failed to update selling price: " + error.message);
    }
  };

  // Profit calculation: (sellingPrice - purchasePrice) * stock
  const profitForProduct = (p) => {
    const sellPrice = parseFloat(sellingPrices[p.id]) ?? (p.sellingPrice ?? p.price);
    return ((sellPrice - p.price) * p.stock).toFixed(2);
  };

  // High demand logic: if amountSold > threshold (e.g., 50 units)
  const isHighDemand = (product) => (product.amountSold || 0) >= 50;

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 20).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalProducts = products.length;

  return (
    <div className="min-h-screen bg-[#435355] p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">📦 Live Inventory Management</h1>

      {alerts.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-600 rounded">
          <h3 className="font-bold mb-2">🔔 Low Stock Alerts</h3>
          <ul>
            {alerts.map((alert) => (
              <li key={alert.id}>
                {alert.name} is running low (Stock: {alert.stock})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legend for high demand */}
      <div className="mb-2 text-xs text-gray-200">
        <span className="inline-flex items-center">
          <span className="text-blue-400 text-lg mr-1">📈</span> High Demand Product (popular with customers)
        </span>
      </div>

      {/* Summary Boxes */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        <div className="bg-[#012A2D] p-4 rounded-lg shadow text-center">
          <p className="text-lg font-bold">Total Stock</p>
          <p className="text-2xl">{totalStock}</p>
        </div>
        <div className="bg-yellow-600 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-bold">Low Stock</p>
          <p className="text-2xl">{lowStockCount}</p>
        </div>
        <div className="bg-red-600 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-bold">Out of Stock</p>
          <p className="text-2xl">{outOfStockCount}</p>
        </div>
        <div className="bg-green-600 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-bold">Total Value</p>
          <p className="text-2xl">₹{totalValue.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-blue-600 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-bold">Total Products</p>
          <p className="text-2xl">{totalProducts}</p>
        </div>
        <div className="bg-purple-600 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-bold">Total Potential Profit</p>
          <p className="text-2xl">
            ₹
            {products
              .reduce((sum, p) => {
                const profit = parseFloat(profitForProduct(p));
                return sum + (isNaN(profit) ? 0 : profit);
              }, 0)
              .toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#012A2D] p-4 rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#435355]">
              <th className="p-3 text-left">Product Name</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Purchase Price</th>
              <th className="p-3 text-left">Selling Price</th>
              <th className="p-3 text-left">Profit</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isOutOfStock = product.stock === 0;
              const sellPriceValue = sellingPrices[product.id] ?? product.sellingPrice ?? product.price;
              const highDemand = isHighDemand(product);

              return (
                <tr key={product.id} className="hover:bg-[#2a3b3c] transition-colors">
                  <td className="p-3 flex items-center gap-2">
                    {product.name}
                    {highDemand && (
                      <span title="High Demand" className="ml-1 text-blue-400 text-lg">📈</span>
                    )}
                  </td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3">₹{product.price.toFixed(2)}</td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={sellPriceValue}
                      onChange={(e) => handlePriceChange(product.id, e.target.value)}
                      onBlur={() => updateSellingPrice(product.id)}
                      className="bg-[#435355] rounded px-2 py-1 w-20 text-white border border-gray-600 focus:outline-yellow-400"
                      disabled={isOutOfStock}
                      title={isOutOfStock ? "Cannot change price of out of stock product" : ""}
                    />
                  </td>
                  <td className="p-3">
                    ₹{profitForProduct(product)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded text-sm font-bold ${
                        isOutOfStock ? "bg-red-500 text-white" : "bg-green-500 text-white"
                      }`}
                    >
                      {isOutOfStock ? "Out of Stock" : "In Stock"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
