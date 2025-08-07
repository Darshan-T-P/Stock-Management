import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, doc, query, where, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";

import { updateDoc } from "firebase/firestore";

export default function OrdersPage() {
  const { profile } = useAuth();

  // State for orders and products fetched from Firestore
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // Modal & form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer: "",
    email: "",
    phone: "",
    address: "",
    items: [],
    shipping: "Standard",
  });

  // Fetch orders and products when profile.storeId changes
  useEffect(() => {
    if (!profile?.storeId) return;

    const fetchOrders = async () => {
      try {
        const ordersCol = collection(db, "stores", profile.storeId, "orders");
        const ordersSnapshot = await getDocs(ordersCol);
        const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort descending by date string
        ordersData.sort((a, b) => (a.date < b.date ? 1 : -1));
        setOrders(ordersData);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    const fetchProducts = async () => {
      try {
        const productsCol = collection(db, "stores", profile.storeId, "products");
        const productsSnapshot = await getDocs(productsCol);
        // Map to simpler product list
        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchOrders();
    fetchProducts();
  }, [profile?.storeId]);

  // Helper to add a product to order items
  const addItemToOrder = (product) => {
    const existing = newOrder.items.find(item => item.name === product.name);
    if (existing) {
      setNewOrder(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      }));
    } else {
      setNewOrder(prev => ({
        ...prev,
        items: [...prev.items, { name: product.name, quantity: 1, price: product.price }],
      }));
    }
  };

  const removeItemFromOrder = (name) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.name !== name),
    }));
  };

  const updateItemQuantity = (name, quantity) => {
    if (quantity <= 0) {
      removeItemFromOrder(name);
      return;
    }
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.name === name
          ? { ...item, quantity: Number(quantity) }
          : item
      ),
    }));
  };

  // Calculate total order amount
  const calculateTotal = () => {
    return newOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Validate and submit new order to Firestore
  const handleAddOrder = async () => {
    if (!newOrder.customer.trim() || !newOrder.email.trim() || newOrder.items.length === 0) {
      alert("Please fill all mandatory fields and add at least one item.");
      return;
    }
    if (!profile?.storeId) {
      alert("Store not found or not logged in.");
      return;
    }

    const orderData = {
      ...newOrder,
      total: calculateTotal(),
      date: new Date().toISOString().split("T")[0],
      status: "Processing",
      createdAt: serverTimestamp(),
    };

    try {
      const ordersCol = collection(db, "stores", profile.storeId, "orders");
      await addDoc(ordersCol, orderData);
      // Refresh orders list
      const ordersSnapshot = await getDocs(ordersCol);
      const refreshedOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      refreshedOrders.sort((a, b) => (a.date < b.date ? 1 : -1));
      setOrders(refreshedOrders);

      // Reset form and close modal
      setNewOrder({
        customer: "",
        email: "",
        phone: "",
        address: "",
        items: [],
        shipping: "Standard",
      });
      setShowAddModal(false);
    } catch (error) {
      alert("Failed to create order: " + error.message);
    }
  };

  // Utility: map order status to colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Processing": return "bg-blue-500 text-white";
      case "Shipped": return "bg-yellow-500 text-black";
      case "Delivered": return "bg-green-500 text-white";
      case "Cancelled": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-[#012D3E] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Order Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            + Add Order
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1F3A44] p-6 rounded-lg">
            <p className="text-gray-300 text-sm">Total Orders</p>
            <p className="text-3xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-[#1F3A44] p-6 rounded-lg">
            <p className="text-gray-300 text-sm">Processing</p>
            <p className="text-3xl font-bold">{orders.filter(o => o.status === "Processing").length}</p>
          </div>
          <div className="bg-[#1F3A44] p-6 rounded-lg">
            <p className="text-gray-300 text-sm">Shipped</p>
            <p className="text-3xl font-bold">{orders.filter(o => o.status === "Shipped").length}</p>
          </div>
          <div className="bg-[#1F3A44] p-6 rounded-lg">
            <p className="text-gray-300 text-sm">Delivered</p>
            <p className="text-3xl font-bold">{orders.filter(o => o.status === "Delivered").length}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#1D3443] rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#0B1D25]">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#0B1D25]">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Order ID</th>
                  <th className="p-3 text-left text-sm font-medium">Customer</th>
                  <th className="p-3 text-left text-sm font-medium">Email</th>
                  <th className="p-3 text-left text-sm font-medium">Items</th>
                  <th className="p-3 text-left text-sm font-medium">Total</th>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                  <th className="p-3 text-left text-sm font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-400">No orders found.</td>
                  </tr>
                ) : orders.map(order => (
                  <tr key={order.id} className="hover:bg-[#0F2530] transition-colors">
                    <td className="p-3">{order.id}</td>
                    <td className="p-3 font-semibold">{order.customer}</td>
                    <td className="p-3">{order.email}</td>
                    <td className="p-3">{order.items.length} item{order.items.length > 1 ? "s" : ""}</td>
                    <td className="p-3">₹{order.total.toFixed(2)}</td>
                    <td className="p-3">
  <select
    value={order.status}
    onChange={async (e) => {
      const newStatus = e.target.value;
      try {
        await updateDoc(doc(db, "stores", profile.storeId, "orders", order.id), {
          status: newStatus,
        });
        // Optimistically update UI
        setOrders((prev) =>
          prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o)
        );
      } catch (error) {
        alert("Failed to update status: " + error.message);
      }
    }}
    className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(order.status)}`}
    style={{ minWidth: 110 }}
  >
    <option value="Processing">Processing</option>
    <option value="Shipped">Shipped</option>
    <option value="Delivered">Delivered</option>
    <option value="Cancelled">Cancelled</option>
  </select>
</td>

                    <td className="p-3">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Order Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#27445d] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto p-6 relative">
              <button
                className="absolute top-4 right-4 text-white text-2xl font-bold"
                onClick={() => setShowAddModal(false)}
                title="Close"
              >
                &times;
              </button>

              <h2 className="text-xl font-bold mb-4 text-white">Add New Order</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                {/* Customer Info */}
                <div>
                  <label className="block mb-1 font-semibold">Customer Name *</label>
                  <input
                    type="text"
                    className="w-full p-2 bg-[#1F3A44] rounded"
                    value={newOrder.customer}
                    onChange={e =>
                      setNewOrder(prev => ({ ...prev, customer: e.target.value }))
                    }
                  />
                  <label className="block mt-4 mb-1 font-semibold">Email *</label>
                  <input
                    type="email"
                    className="w-full p-2 bg-[#1F3A44] rounded"
                    value={newOrder.email}
                    onChange={e =>
                      setNewOrder(prev => ({ ...prev, email: e.target.value }))
                    }
                  />
                  <label className="block mt-4 mb-1 font-semibold">Phone</label>
                  <input
                    type="tel"
                    className="w-full p-2 bg-[#1F3A44] rounded"
                    value={newOrder.phone}
                    onChange={e =>
                      setNewOrder(prev => ({ ...prev, phone: e.target.value }))
                    }
                  />
                  <label className="block mt-4 mb-1 font-semibold">Address</label>
                  <textarea
                    className="w-full p-2 bg-[#1F3A44] rounded"
                    rows={3}
                    value={newOrder.address}
                    onChange={e =>
                      setNewOrder(prev => ({ ...prev, address: e.target.value }))
                    }
                  />
                  <label className="block mt-4 mb-1 font-semibold">Shipping Method</label>
                  <select
                    className="w-full p-2 bg-[#1F3A44] rounded"
                    value={newOrder.shipping}
                    onChange={e =>
                      setNewOrder(prev => ({ ...prev, shipping: e.target.value }))
                    }
                  >
                    <option value="Standard">Standard</option>
                    <option value="Express">Express</option>
                    <option value="Overnight">Overnight</option>
                  </select>
                </div>

                {/* Product Selection */}
                <div>
                  <label className="block mb-2 font-semibold">Available Products</label>
                  <div className="max-h-48 overflow-auto border border-gray-700 rounded p-2 bg-[#1F3A44]">
                    {products.length === 0 ? (
                      <p className="text-gray-400">No products found</p>
                    ) : (
                      products.map(product => (
                        <button
                          type="button"
                          key={product.id}
                          className="w-full text-left p-1 hover:bg-[#35627f] rounded"
                          onClick={() => addItemToOrder(product)}
                        >
                          {product.name} - ₹{product.price.toFixed(2)} (Stock: {product.stock})
                        </button>
                      ))
                    )}
                  </div>

                  <label className="block mt-6 mb-2 font-semibold">Selected Items</label>
                  <div className="max-h-48 overflow-auto border border-gray-700 rounded p-2 bg-[#1F3A44]">
                    {newOrder.items.length === 0 ? (
                      <p className="text-gray-400">No items selected</p>
                    ) : (
                      newOrder.items.map(item => (
                        <div key={item.name} className="flex items-center justify-between mb-2">
                          <div>
                            <p>{item.name}</p>
                            <p className="text-sm text-gray-300">₹{item.price.toFixed(2)} each</p>
                          </div>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => updateItemQuantity(item.name, e.target.value)}
                            className="w-16 p-1 rounded bg-[#35627f] text-white border border-gray-600"
                          />
                          <button
                            onClick={() => removeItemFromOrder(item.name)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-2 text-right text-lg font-semibold">
                    Total: ₹{calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-yellow-500 rounded hover:bg-yellow-400 font-semibold"
                  onClick={handleAddOrder}
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
