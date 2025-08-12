import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import Modal from "../../components/Modal";
import { adjustProductStock } from "../../utils/stockUtils";

export default function SalesManagement() {
  const { profile } = useAuth();

  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSale, setNewSale] = useState({ customer: "", products: [], total: 0 });

  useEffect(() => {
    if (!profile?.storeId) return;
    getDocs(collection(db, "stores", profile.storeId, "sales")).then(snap =>
      setSales(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
    getDocs(collection(db, "stores", profile.storeId, "products")).then(snap =>
      setInventory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
  }, [profile?.storeId]);

  const addProductToSale = (product) => {
    setNewSale(prev => ({
      ...prev,
      products: [...prev.products, product],
      total: +(prev.total + product.price).toFixed(2),
    }));
  };

  const removeProductFromSale = (index) => {
    setNewSale(prev => {
      const removed = prev.products[index];
      return {
        ...prev,
        products: prev.products.filter((_, i) => i !== index),
        total: +(prev.total - removed.price).toFixed(2),
      };
    });
  };

  const handleSaveSale = async () => {
    if (!newSale.customer.trim() || !newSale.products.length) return;
    try {
      for (const p of newSale.products) {
        await adjustProductStock(
          profile.storeId,
          p.id,
          -1,
          { amountSold: (p.amountSold || 0) + 1 }
        );
      }
      const salesCol = collection(db, "stores", profile.storeId, "sales");
      const saleRef = await addDoc(salesCol, {
        customer: newSale.customer,
        products: newSale.products.map(p => p.name),
        total: newSale.total,
        date: new Date().toISOString().slice(0, 10),
        status: "Completed",
      });
      setSales(prev => [
        { id: saleRef.id, ...newSale, products: newSale.products.map(p => p.name), date: new Date().toISOString().slice(0, 10), status: "Completed" },
        ...prev
      ]);
      setNewSale({ customer: "", products: [], total: 0 });
      setShowAddModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm("Delete this sale?")) return;
    await deleteDoc(doc(db, "stores", profile.storeId, "sales", saleId));
    setSales(prev => prev.filter(s => s.id !== saleId));
  };

  const groceryItems = inventory.map(p => ({
    id: p.id,
    name: p.name,
    price: p.sellingPrice ?? p.price,
    stock: p.stock ?? 0,
    amountSold: p.amountSold ?? 0,
    emoji: p.emoji ?? "📦"
  }));

  return (
    <div className="p-6 text-white bg-[#012D3E] min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Sales Management</h1>
        <button className="bg-yellow-400 text-black px-4 py-2 rounded"
          onClick={() => setShowAddModal(true)}>+ Add Sale</button>
      </div>

      {/* Sales table */}
      <div className="bg-[#435355] rounded">
        <table className="w-full">
          <thead className="bg-[#012D3E]">
            <tr>
              <th>Customer</th><th>Products</th><th>Total</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(s => (
              <tr key={s.id} className="border-t border-[#012A2D]">
                <td>{s.customer}</td>
                <td>{s.products.join(", ")}</td>
                <td>₹{s.total}</td>
                <td>{s.date}</td>
                <td>
                  <button onClick={() => handleDeleteSale(s.id)} className="bg-red-500 px-2 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <Modal
          title="Add Sale"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSaveSale}
          submitDisabled={!newSale.customer.trim() || !newSale.products.length}
          submitText="Save Sale"
          content={
            <SaleForm
              newSale={newSale}
              setNewSale={setNewSale}
              addProductToSale={addProductToSale}
              removeProductFromSale={removeProductFromSale}
              groceryItems={groceryItems}
            />
          }
        />
      )}
    </div>
  );
}

function SaleForm({ newSale, setNewSale, addProductToSale, removeProductFromSale, groceryItems }) {
  return (
    <div>
      <input
        className="w-full mb-2 p-2 rounded"
        placeholder="Customer Name"
        value={newSale.customer}
        onChange={(e) => setNewSale({ ...newSale, customer: e.target.value })}
      />
      <div className="mb-2">Selected:</div>
      {newSale.products.map((p, i) => (
        <div key={i} className="flex justify-between">
          <span>{p.name} ₹{p.price}</span>
          <button onClick={() => removeProductFromSale(i)}>x</button>
        </div>
      ))}
      <div>Total: ₹{newSale.total}</div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {groceryItems.map(item => (
          <button key={item.id} disabled={item.stock <= 0} onClick={() => addProductToSale(item)}
            className="bg-[#012A2D] p-2 rounded">
            {item.name} (₹{item.price}) Stock: {item.stock}
          </button>
        ))}
      </div>
    </div>
  );
}
