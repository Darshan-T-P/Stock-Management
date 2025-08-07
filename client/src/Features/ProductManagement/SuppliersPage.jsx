import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db } from "../../firebase";

// Master product list with defined prices
const masterProducts = [
  { id: "milk", name: "Milk", price: 3.99 },
  { id: "bread", name: "Bread", price: 2.49 },
  { id: "eggs", name: "Eggs", price: 4.99 },
  { id: "rice", name: "Rice", price: 8.99 },
  { id: "pasta", name: "Pasta", price: 2.99 },
  { id: "flour", name: "Flour", price: 4.49 },
  { id: "sugar", name: "Sugar", price: 3.99 },
  { id: "salt", name: "Salt", price: 1.99 },
  { id: "apples", name: "Apples", price: 1.99 },
  { id: "bananas", name: "Bananas", price: 1.49 },
  { id: "oranges", name: "Oranges", price: 2.99 },
  { id: "tomatoes", name: "Tomatoes", price: 3.49 },
  { id: "potatoes", name: "Potatoes", price: 4.99 },
  { id: "onions", name: "Onions", price: 2.99 },
  { id: "carrots", name: "Carrots", price: 1.99 },
  { id: "chicken", name: "Chicken", price: 12.99 },
  { id: "beef", name: "Beef", price: 15.99 },
  { id: "fish", name: "Fish", price: 18.99 },
  { id: "cheese", name: "Cheese", price: 6.99 },
  { id: "yogurt", name: "Yogurt", price: 4.99 },
  { id: "butter", name: "Butter", price: 5.99 },
  { id: "cooking_oil", name: "Cooking Oil", price: 450.0 },
  { id: "tea", name: "Tea", price: 180.0 },
  { id: "coffee", name: "Coffee", price: 250.0 },
  { id: "spices", name: "Spices", price: 150.0 },
  { id: "nuts", name: "Nuts", price: 350.0 },
  { id: "dried_fruits", name: "Dried Fruits", price: 400.0 },
];

// Helper to get product price from master list by product name
function getProductPrice(productName) {
  const product = masterProducts.find((p) => p.name === productName);
  return product?.price ?? 0;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    products: [],
    rating: 4.0,
    status: "Active",
  });

  // Fetch suppliers from Firestore with realtime updates
  useEffect(() => {
    const suppliersCol = collection(db, "suppliers");
    const q = query(suppliersCol);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const suppliersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSuppliers(suppliersData);
      },
      (error) => {
        console.error("Failed to load suppliers:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const availableProducts = masterProducts.map((p) => p.name);

  const addProductToSupplier = (product) => {
    if (!newSupplier.products.includes(product)) {
      setNewSupplier((prev) => ({
        ...prev,
        products: [...prev.products, product],
      }));
    }
  };

  const removeProductFromSupplier = (product) => {
    setNewSupplier((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p !== product),
    }));
  };

  // Backend add new supplier
  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.email || !newSupplier.address) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const suppliersCol = collection(db, "suppliers");

      await addDoc(suppliersCol, {
        name: newSupplier.name,
        contact: newSupplier.contact,
        email: newSupplier.email,
        phone: newSupplier.phone,
        address: newSupplier.address,
        products: newSupplier.products,
        rating: newSupplier.rating ?? 4.0,
        status: newSupplier.status ?? "Active",
      });

      setNewSupplier({
        name: "",
        contact: "",
        email: "",
        phone: "",
        address: "",
        products: [],
        rating: 4.0,
        status: "Active",
      });
      setShowAddModal(false);
    } catch (error) {
      alert("Failed to add supplier: " + error.message);
      console.error(error);
    }
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowViewModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setNewSupplier({
      name: supplier.name || "",
      contact: supplier.contact || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      products: supplier.products || [],
      rating: supplier.rating || 4.0,
      status: supplier.status || "Active",
    });
    setShowEditModal(true);
  };

  // Backend update supplier
  const handleUpdateSupplier = async () => {
    if (!selectedSupplier || !newSupplier.name || !newSupplier.email || !newSupplier.address) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const supplierRef = doc(db, "suppliers", selectedSupplier.id);
      await updateDoc(supplierRef, {
        name: newSupplier.name,
        contact: newSupplier.contact,
        email: newSupplier.email,
        phone: newSupplier.phone,
        address: newSupplier.address,
        products: newSupplier.products,
        rating: newSupplier.rating ?? 4.0,
        status: newSupplier.status ?? "Active",
      });

      setNewSupplier({
        name: "",
        contact: "",
        email: "",
        phone: "",
        address: "",
        products: [],
        rating: 4.0,
        status: "Active",
      });
      setSelectedSupplier(null);
      setShowEditModal(false);
    } catch (error) {
      alert("Failed to update supplier: " + error.message);
      console.error(error);
    }
  };

  // Backend delete supplier
  const handleDeleteSupplier = async (supplierId) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;

    try {
      const supplierRef = doc(db, "suppliers", supplierId);
      await deleteDoc(supplierRef);
    } catch (error) {
      alert("Failed to delete supplier: " + error.message);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#012A2D] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Supplier Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            + Add Supplier
          </button>
        </div>

        {/* Supplier Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard title="Total Suppliers" value={suppliers.length} icon="🏢" />
          <SummaryCard
            title="Active"
            value={suppliers.filter((s) => s.status === "Active").length}
            icon="✅"
          />
          <SummaryCard
            title="Inactive"
            value={suppliers.filter((s) => s.status === "Inactive").length}
            icon="⏸️"
          />
          <SummaryCard
            title="Avg Rating"
            value={
              suppliers.length
                ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)
                : "N/A"
            }
            icon="⭐"
          />
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onView={() => handleViewSupplier(supplier)}
              onEdit={() => handleEditSupplier(supplier)}
              onDelete={() => handleDeleteSupplier(supplier.id)}
            />
          ))}
        </div>

        {/* Add Supplier Modal */}
        {showAddModal && (
          <Modal
            title="Add New Supplier"
            onClose={() => setShowAddModal(false)}
            content={
              <SupplierForm
                supplier={newSupplier}
                setSupplier={setNewSupplier}
                availableProducts={availableProducts}
                addProduct={addProductToSupplier}
                removeProduct={removeProductFromSupplier}
              />
            }
            onSubmit={handleAddSupplier}
            submitDisabled={!newSupplier.name || !newSupplier.email || !newSupplier.address}
            submitText="Add Supplier"
          />
        )}

        {/* View Supplier Modal */}
        {showViewModal && selectedSupplier && (
          <Modal
            title="Supplier Details"
            onClose={() => setShowViewModal(false)}
            content={<SupplierDetails supplier={selectedSupplier} />}
            submitDisabled={true}
          />
        )}

        {/* Edit Supplier Modal */}
        {showEditModal && selectedSupplier && (
          <Modal
            title={`Edit Supplier ${selectedSupplier.name}`}
            onClose={() => setShowEditModal(false)}
            content={
              <SupplierForm
                supplier={newSupplier}
                setSupplier={setNewSupplier}
                availableProducts={availableProducts}
                addProduct={addProductToSupplier}
                removeProduct={removeProductFromSupplier}
              />
            }
            onSubmit={handleUpdateSupplier}
            submitDisabled={!newSupplier.name || !newSupplier.email || !newSupplier.address}
            submitText="Update Supplier"
          />
        )}
      </div>
    </div>
  );
}

// SummaryCard Component for summary stats
function SummaryCard({ title, value, icon }) {
  return (
    <div className="bg-[#435355] p-6 rounded-lg flex items-center justify-between">
      <div>
        <p className="text-gray-300 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  );
}

// Supplier Card component
function SupplierCard({ supplier, onView, onEdit, onDelete }) {
  return (
    <div className="bg-[#435355] rounded-lg p-6 hover:bg-[#1a3a3d] transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{supplier.name}</h3>
          <p className="text-sm text-gray-300">{supplier.contact}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            supplier.status === "Active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
          }`}
        >
          {supplier.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <ContactInfo icon="📧" value={supplier.email} />
        <ContactInfo icon="📞" value={supplier.phone} />
        <ContactInfo icon="📍" value={supplier.address} isGray />
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Products:</p>
        <div className="flex flex-wrap gap-1">
          {supplier.products.map((product, index) => (
            <span key={index} className="px-2 py-1 bg-[#012A2D] text-xs rounded">
              {product} (${getProductPrice(product).toFixed(2)})
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-yellow-400 mr-1">⭐</span>
          <span className="text-sm">{supplier.rating}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onView}
            className="text-blue-400 hover:text-blue-300 text-sm bg-blue-900 bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30 transition-colors"
          >
            View
          </button>
          <button
            onClick={onEdit}
            className="text-green-400 hover:text-green-300 text-sm bg-green-900 bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 text-sm bg-red-900 bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Contact Info Row
function ContactInfo({ icon, value, isGray = false }) {
  return (
    <div className={`flex items-center text-sm ${isGray ? "text-gray-400" : "text-gray-300"}`}>
      <span className="mr-2">{icon}</span> <span>{value || "-"}</span>
    </div>
  );
}

// Modal component
function Modal({ title, onClose, content, onSubmit, submitDisabled, submitText }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#435355] rounded-lg p-6 w-full max-w-4xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl font-bold">
            ×
          </button>
        </div>
        <div>{content}</div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              disabled={submitDisabled}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                submitDisabled
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-yellow-400 text-black hover:bg-yellow-300"
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

// Supplier form component (Add/Edit)
function SupplierForm({ supplier, setSupplier, availableProducts, addProduct, removeProduct }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-white">
      {/* Supplier Info */}
      <div className="space-y-4">
        <InputField
          label="Supplier Name *"
          value={supplier.name}
          onChange={(e) => setSupplier((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Enter supplier name"
        />
        <InputField
          label="Contact Person"
          value={supplier.contact}
          onChange={(e) => setSupplier((prev) => ({ ...prev, contact: e.target.value }))}
          placeholder="Enter contact person name"
        />
        <InputField
          label="Email *"
          type="email"
          value={supplier.email}
          onChange={(e) => setSupplier((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="Enter email address"
        />
        <InputField
          label="Phone Number"
          type="tel"
          value={supplier.phone}
          onChange={(e) => setSupplier((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="Enter phone number"
        />
        <TextAreaField
          label="Address *"
          value={supplier.address}
          onChange={(e) => setSupplier((prev) => ({ ...prev, address: e.target.value }))}
          placeholder="Enter complete address"
          rows={3}
        />
      </div>

      {/* Product Selection */}
      <div>
        <label className="block mb-2 font-semibold">Selected Products</label>
        <div className="bg-[#012A2D] rounded-lg p-3 min-h-[200px] mb-4 overflow-y-auto max-h-[250px]">
          {supplier.products.length === 0 ? (
            <p className="text-gray-400 text-sm">No products selected</p>
          ) : (
            <div className="space-y-2">
              {supplier.products.map((product, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#435355] p-2 rounded">
                  <span>
                    {product} (${getProductPrice(product).toFixed(2)})
                  </span>
                  <button
                    onClick={() => removeProduct(product)}
                    className="text-red-400 hover:text-red-300 text-sm"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="block mb-2 font-semibold">Available Products</label>
        <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
          {availableProducts.map((product, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addProduct(product)}
              disabled={supplier.products.includes(product)}
              className="bg-[#012A2D] p-2 rounded text-sm hover:bg-[#2a3a3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product} (${getProductPrice(product).toFixed(2)})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple reusable input components
function InputField({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block mb-2 font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 bg-[#012A2D] rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none text-white"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows, placeholder }) {
  return (
    <div>
      <label className="block mb-2 font-semibold">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full p-3 bg-[#012A2D] rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none text-white"
      />
    </div>
  );
}

// Supplier Details component (view only)
function SupplierDetails({ supplier }) {
  return (
    <div className="space-y-4 text-white">
      <div>
        <label className="block mb-1 font-semibold">Supplier ID</label>
        <p>#{supplier.id}</p>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Name</label>
        <p>{supplier.name}</p>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Contact Person</label>
        <p>{supplier.contact || "-"}</p>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Email</label>
        <p>{supplier.email || "-"}</p>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Phone</label>
        <p>{supplier.phone || "-"}</p>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Address</label>
        <p>{supplier.address || "-"}</p>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Products</label>
        <div className="bg-[#012A2D] rounded p-3 max-h-48 overflow-y-auto">
          {supplier.products.length === 0 ? (
            <p>No products</p>
          ) : (
            supplier.products.map((product, idx) => (
              <div key={idx} className="py-1">
                • {product} (${getProductPrice(product).toFixed(2)})
              </div>
            ))
          )}
        </div>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Rating</label>
        <p>{supplier.rating || "-"}</p>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Status</label>
        <span
          className={`px-2 py-1 text-xs rounded ${
            supplier.status === "Active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
          }`}
        >
          {supplier.status}
        </span>
      </div>
    </div>
  );
}
