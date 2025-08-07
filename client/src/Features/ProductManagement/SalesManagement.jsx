import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";

export default function SalesPage() {
  const { profile } = useAuth();

  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedSale, setSelectedSale] = useState(null);

  const [newSale, setNewSale] = useState({
    customer: "",
    products: [], // array of product names
    total: 0,
  });

  // Fetch sales records
  useEffect(() => {
    if (!profile?.storeId) return;

    const fetchSales = async () => {
      try {
        const salesCol = collection(db, "stores", profile.storeId, "sales");
        const snapshot = await getDocs(salesCol);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSales(data);
      } catch (err) {
        console.error("Failed to fetch sales:", err);
      }
    };

    fetchSales();
  }, [profile?.storeId]);

  // Fetch inventory with stock > 0
  useEffect(() => {
    if (!profile?.storeId) return;

    const fetchInventory = async () => {
      try {
        const productsCol = collection(db, "stores", profile.storeId, "products");
        const snapshot = await getDocs(productsCol);
        const productsData = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((p) => (p.stock || 0) > 0);
        setInventory(productsData);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      }
    };

    fetchInventory();
  }, [profile?.storeId]);

  // Add product to the new sale
  const addProductToSale = (product) => {
    // product here is {id, name, price, ...}
    setNewSale((prev) => ({
      ...prev,
      products: [...prev.products, product.name],
      total: +(prev.total + (product.sellingPrice ?? product.price)).toFixed(2),
    }));
  };

  // Remove product from new sale by index
  const removeProductFromSale = (index) => {
    const removedProductName = newSale.products[index];
    const prod = inventory.find((p) => p.name === removedProductName);
    if (!prod) return;

    setNewSale((prev) => {
      const updatedProducts = prev.products.filter((_, i) => i !== index);
      const updatedTotal = +(
        prev.total -
        (prod.sellingPrice ?? prod.price)
      ).toFixed(2);
      return {
        ...prev,
        products: updatedProducts,
        total: updatedTotal >= 0 ? updatedTotal : 0,
      };
    });
  };

  // Process sale: create sale doc and update inventory stock and amountSold
  const processSale = async (saleData) => {
    if (!profile?.storeId) throw new Error("Store ID missing");

    const productsCol = collection(db, "stores", profile.storeId, "products");
    try {
      // Validate stock availability for each product (assumes quantity 1 per product)
      for (const productName of saleData.products) {
        const q = query(productsCol, where("name", "==", productName));
        const snapshot = await getDocs(q);
        if (snapshot.empty) throw new Error(`Product ${productName} not found.`);

        const prodDoc = snapshot.docs[0];
        const prodData = prodDoc.data();

        if ((prodData.stock || 0) < 1)
          throw new Error(`Insufficient stock for ${productName}.`);
      }

      // Add the sale record
      const salesCol = collection(db, "stores", profile.storeId, "sales");
      const newSaleRef = await addDoc(salesCol, {
        customer: saleData.customer,
        products: saleData.products,
        total: saleData.total,
        date: new Date().toISOString().slice(0, 10),
        status: "Completed",
      });

      // Update inventory stock and amountSold
      for (const productName of saleData.products) {
        const q = query(productsCol, where("name", "==", productName));
        const snapshot = await getDocs(q);
        const prodDoc = snapshot.docs[0];
        const prodData = prodDoc.data();
        const prodRef = doc(db, "stores", profile.storeId, "products", prodDoc.id);

        await updateDoc(prodRef, {
          stock: prodData.stock - 1,
          amountSold: (prodData.amountSold || 0) + 1,
        });
      }

      return { success: true, saleId: newSaleRef.id };
    } catch (error) {
      console.error("Error processing sale:", error);
      return { success: false, error: error.message };
    }
  };

  // Add sale handler
  const handleAddSale = async () => {
    if (!newSale.customer.trim() || newSale.products.length === 0) return;

    const result = await processSale(newSale);
    if (result.success) {
      setSales((prev) => [
        {
          id: result.saleId,
          customer: newSale.customer,
          products: [...newSale.products],
          total: newSale.total,
          date: new Date().toISOString().slice(0, 10),
          status: "Completed",
        },
        ...prev,
      ]);
      setNewSale({ customer: "", products: [], total: 0 });
      setShowAddModal(false);
      alert("Sale recorded successfully.");
      // Refresh inventory to update stock in picker
      const productsCol = collection(db, "stores", profile.storeId, "products");
      const snapshot = await getDocs(productsCol);
      const productsData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((p) => (p.stock || 0) > 0);
      setInventory(productsData);
    } else {
      alert("Failed to record sale: " + result.error);
    }
  };

  // Update existing sale
  const handleUpdateSale = async () => {
    if (!selectedSale || !newSale.customer.trim() || newSale.products.length === 0)
      return;
    if (!profile?.storeId) return;

    try {
      const saleRef = doc(db, "stores", profile.storeId, "sales", selectedSale.id);
      await updateDoc(saleRef, {
        customer: newSale.customer,
        products: newSale.products,
        total: newSale.total,
      });

      setSales((prev) =>
        prev.map((sale) =>
          sale.id === selectedSale.id
            ? { ...sale, customer: newSale.customer, products: newSale.products, total: newSale.total }
            : sale
        )
      );

      setSelectedSale(null);
      setNewSale({ customer: "", products: [], total: 0 });
      setShowEditModal(false);
      alert("Sale updated successfully.");
    } catch (err) {
      alert("Failed to update sale: " + err.message);
    }
  };

  // Delete sale
  const handleDeleteSale = async (saleId) => {
    if (!profile?.storeId) return;
    if (!window.confirm("Are you sure you want to delete this sale?")) return;

    try {
      const saleRef = doc(db, "stores", profile.storeId, "sales", saleId);
      await deleteDoc(saleRef);
      setSales((prev) => prev.filter((sale) => sale.id !== saleId));
      alert("Sale deleted successfully.");
      // Optionally refresh inventory here
    } catch (error) {
      alert("Failed to delete sale: " + error.message);
    }
  };

  // Open view modal
  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setShowViewModal(true);
  };

  // Open edit modal and populate sale form
  const handleEditSale = (sale) => {
    setSelectedSale(sale);
    setNewSale({
      customer: sale.customer,
      products: [...sale.products],
      total: sale.total,
    });
    setShowEditModal(true);
  };

  // Grocery items for original fallback - not displayed now but kept if needed
  const groceryItems = inventory.map((p) => ({
    name: p.name,
    price: p.sellingPrice ?? p.price,
    emoji: p.emoji ?? "📦",
  }));

  return (
    <div className="min-h-screen bg-[#012D3E] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Sales Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            + Add Sale
          </button>
        </div>

        {/* Sales Table */}
        <div className="bg-[#435355] rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#012D3E]">
            <h2 className="text-xl font-semibold">Recent Sales</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-[#012D3E]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Sale ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Products</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Total (₹)</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#012D3E]">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6 text-gray-400">
                      No sales found.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-[#0f2f42] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm">#{sale.id}</td>
                      <td className="px-6 py-4 text-sm font-medium">{sale.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{sale.products.join(", ")}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{sale.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{sale.date}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            sale.status === "Completed" ? "bg-green-500" : "bg-yellow-500 text-black"
                          } text-white`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewSale(sale)}
                            className="text-blue-400 hover:text-blue-300 text-sm bg-blue-900 bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditSale(sale)}
                            className="text-green-400 hover:text-green-300 text-sm bg-green-900 bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="text-red-400 hover:text-red-300 text-sm bg-red-900 bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Sale Modal */}
        {showAddModal && (
          <Modal
            title="Add New Sale"
            onClose={() => setShowAddModal(false)}
            content={
              <SaleForm
                newSale={newSale}
                setNewSale={setNewSale}
                addProductToSale={addProductToSale}
                removeProductFromSale={removeProductFromSale}
                groceryItems={inventory} // Pass inventory with actual prices
              />
            }
            onSubmit={handleAddSale}
            submitDisabled={!newSale.customer.trim() || newSale.products.length === 0}
            submitText="Add Sale"
          />
        )}

        {/* View Sale Modal */}
        {showViewModal && selectedSale && (
          <Modal
            title="Sale Details"
            onClose={() => setShowViewModal(false)}
            content={<SaleDetails sale={selectedSale} />}
            submitDisabled={true}
          />
        )}

        {/* Edit Sale Modal */}
        {showEditModal && selectedSale && (
          <Modal
            title={`Edit Sale #${selectedSale.id}`}
            onClose={() => setShowEditModal(false)}
            content={
              <SaleForm
                newSale={newSale}
                setNewSale={setNewSale}
                addProductToSale={addProductToSale}
                removeProductFromSale={removeProductFromSale}
                groceryItems={inventory}
              />
            }
            onSubmit={handleUpdateSale}
            submitDisabled={!newSale.customer.trim() || newSale.products.length === 0}
            submitText="Update Sale"
          />
        )}
      </div>
    </div>
  );
}

// Modal component
function Modal({ title, onClose, content, onSubmit, submitDisabled, submitText }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-[#435355] rounded-lg max-w-4xl w-full max-h-full p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-white text-2xl font-bold">×</button>
        </div>
        <div>{content}</div>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              disabled={submitDisabled}
              className={`px-6 py-2 rounded font-semibold ${
                submitDisabled ? "bg-gray-600 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-300"
              }`}
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Sale Form component
function SaleForm({ newSale, setNewSale, addProductToSale, removeProductFromSale, groceryItems }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer info */}
        <div>
          <label className="block mb-2 font-semibold">Customer Name</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-[#012D3E] border border-gray-600 text-white"
            value={newSale.customer}
            onChange={(e) => setNewSale({ ...newSale, customer: e.target.value })}
            placeholder="Enter customer name"
          />
        </div>

        {/* Selected products */}
        <div>
          <label className="block mb-2 font-semibold">Selected Products</label>
          <div className="bg-[#012D3E] rounded p-3 min-h-[100px] max-h-[200px] overflow-auto">
            {newSale.products.length === 0 ? (
              <p className="text-gray-400">No products selected</p>
            ) : (
              newSale.products.map((prodName, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#1a3a4d] rounded p-1 mb-1">
                  <span>{prodName}</span>
                  <button
                    onClick={() => removeProductFromSale(idx)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="text-right font-bold mt-2">
            Total: ₹{newSale.total.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Product picker */}
      <div className="mt-6">
        <label className="block mb-3 font-semibold">Select Products</label>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-64 overflow-auto">
          {groceryItems.length === 0 ? (
            <p className="col-span-full text-center text-gray-400">No products in stock</p>
          ) : groceryItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addProductToSale({ name: item.name, price: item.sellingPrice ?? item.price })}
              className="bg-[#012D3E] rounded p-4 flex flex-col items-center justify-center hover:bg-[#1a3a4d]"
              title={`Stock: ${item.stock}`}
            >
              <span className="text-3xl mb-2">{item.emoji ?? "📦"}</span>
              <span>{item.name}</span>
              <span className="text-yellow-300">₹{(item.sellingPrice ?? item.price).toFixed(2)}</span>
              <span className="text-gray-400 text-xs mt-1">Stock: {item.stock}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// Sale Details (read-only)
function SaleDetails({ sale }) {
  return (
    <div className="space-y-4 text-white">
      <div>
        <label className="font-semibold block text-gray-300">Sale ID</label>
        <p>#{sale.id}</p>
      </div>
      <div>
        <label className="font-semibold block text-gray-300">Customer</label>
        <p>{sale.customer}</p>
      </div>
      <div>
        <label className="font-semibold block text-gray-300">Products</label>
        <div className="bg-[#012D3E] max-h-40 overflow-auto rounded p-3">
          {sale.products.map((prodName, idx) => (
            <div key={idx}>• {prodName}</div>
          ))}
        </div>
      </div>
      <div>
        <label className="font-semibold block text-gray-300">Total (₹)</label>
        <p className="text-yellow-300 text-xl font-bold">{sale.total.toFixed(2)}</p>
      </div>
      <div>
        <label className="font-semibold block text-gray-300">Date</label>
        <p>{sale.date}</p>
      </div>
      <div>
        <label className="font-semibold block text-gray-300">Status</label>
        <span className={`px-2 py-1 rounded-full text-xs ${
          sale.status === "Completed" ? "bg-green-500 text-white" : "bg-yellow-500 text-black"
        }`}>
          {sale.status}
        </span>
      </div>
    </div>
  );
}
