import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  query,
  getDocs,
  where,
  doc,
  updateDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

// Master product list remains static or can be fetched similarly if needed
const masterProducts = [
  { id: 1, name: "Rice Bags (25kg)", price: 1200, icon: "🌾" },
  { id: 2, name: "Cooking Oil (5L)", price: 450, icon: "🛢️" },
  { id: 3, name: "Sugar (1kg)", price: 42, icon: "🍬" },
  { id: 4, name: "Wheat Flour (10kg)", price: 380, icon: "🌾" },
  { id: 5, name: "Dal (Lentils) 1kg", price: 85, icon: "🥗" },
  { id: 6, name: "Tea Powder (500g)", price: 180, icon: "🍵" },
  { id: 7, name: "Mustard Oil (1L)", price: 120, icon: "🛢️" },
  { id: 8, name: "Basmati Rice (5kg)", price: 650, icon: "🍚" },
  { id: 9, name: "Milk", price: 3.99, icon: "🥛" },
  { id: 10, name: "Bread", price: 2.49, icon: "🍞" },
  { id: 11, name: "Eggs", price: 4.99, icon: "🥚" },
  { id: 12, name: "Apples", price: 1.99, icon: "🍎" },
  // ...add more as needed
];

export default function ProductManagement() {
  const { profile } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
  const [cart, setCart] = useState([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");

  // Fetch suppliers from Firestore on component mount
  useEffect(() => {
    const suppliersCol = collection(db, "suppliers");
    // Use realtime listener or fallback getDocs for one-time fetch:
    const unsubscribe = onSnapshot(suppliersCol, (snapshot) => {
      const suppliersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSuppliers(suppliersData);
    }, error => {
      console.error("Error fetching suppliers:", error);
      // fallback for one-time load if needed
      // getDocs(suppliersCol).then(...).catch(...)
    });

    return () => unsubscribe();
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const totalBill = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Purchase Modal logic
  const openPurchaseModal = () => {
    setShowPurchaseModal(true);
    setPurchaseItems([]);
    setSelectedSupplier("");
  };

  const handleCartPurchase = async () => {
  if (!profile?.storeId) {
    alert("Store not found or not logged in.");
    return;
  }
  if (cart.length === 0) {
    alert("Add products to cart before purchasing.");
    return;
  }

  try {
    const productsRef = collection(db, "stores", profile.storeId, "products");

    for (const item of cart) {
      // Check if product already in inventory
      const q = query(productsRef, where('productId', '==', item.id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const prodDoc = querySnapshot.docs[0];
        const prodRef = doc(db, "stores", profile.storeId, "products", prodDoc.id);
        const existing = prodDoc.data();

        await updateDoc(prodRef, {
          stock: (existing.stock || 0) + item.quantity,
          amountBought: (existing.amountBought || 0) + item.quantity,
          price: item.price, // update price to latest purchase price
          // optionally update other fields like supplier if you track vendors for these products
        });
      } else {
        // Add new product to inventory
        await setDoc(doc(productsRef), {
          productId: item.id,
          name: item.name,
          stock: item.quantity,
          amountBought: item.quantity,
          amountSold: 0,
          price: item.price,
          // supplier: 'Unknown' or allow selection here if you want
          createdAt: new Date(),
        });
      }
    }

    alert(`Purchased ${cart.reduce((acc, item) => acc + item.quantity, 0)} items successfully!`);
    // Clear cart after purchase
    setCart([]);

    // Optionally, refresh your inventory list here if displayed elsewhere

  } catch (error) {
    alert("Purchase failed: " + error.message);
  }
};

  const addItemToPurchase = (productName) => {
  const exists = purchaseItems.find(p => p.name === productName);
  if (exists) {
    setPurchaseItems(
      purchaseItems.map(p =>
        p.name === productName ? { ...p, quantity: p.quantity + 1 } : p
      )
    );
  } else {
    // Get price from master products list
    const productInfo = masterProducts.find(mp => mp.name === productName) || {};
    setPurchaseItems([
      ...purchaseItems,
      {
        name: productName,
        quantity: 1,
        price: productInfo.price ?? 0,
      }
    ]);
  }
};


  const removeItemFromPurchase = (itemName) => {
    setPurchaseItems(purchaseItems.filter((p) => p.name !== itemName));
  };

  const updatePurchaseQuantity = (itemName, quantity) => {
    setPurchaseItems(
      purchaseItems.map((p) =>
        p.name === itemName ? { ...p, quantity: Math.max(0, quantity) } : p
      )
    );
  };

  const updatePurchasePrice = (itemName, price) => {
    setPurchaseItems(
      purchaseItems.map((p) =>
        p.name === itemName ? { ...p, price: Math.max(0, price) } : p
      )
    );
  };

  // Firestore inventory update on purchase from supplier
  const handleSupplierPurchase = async () => {
    if (!profile?.storeId) {
      alert("Store not found or you are not logged in.");
      return;
    }
    if (!selectedSupplier || purchaseItems.length === 0) {
      alert("Select supplier and at least one product!");
      return;
    }
    try {
      for (const item of purchaseItems) {
        const productsRef = collection(db, "stores", profile.storeId, "products");
        const q = query(productsRef, where("name", "==", item.name));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const prodDoc = querySnapshot.docs[0];
          const prodRef = doc(db, "stores", profile.storeId, "products", prodDoc.id);
          const existing = prodDoc.data();
          await updateDoc(prodRef, {
            stock: (existing.stock || 0) + item.quantity,
            amountBought: (existing.amountBought || 0) + item.quantity,
            price: item.price,
            supplier: selectedSupplier,
          });
        } else {
          await setDoc(doc(productsRef), {
            name: item.name,
            stock: item.quantity,
            amountBought: item.quantity,
            amountSold: 0,
            price: item.price,
            supplier: selectedSupplier,
            createdAt: new Date(),
          });
        }
      }

      alert(`Purchased and added to inventory!`);
      setShowPurchaseModal(false);
      setPurchaseItems([]);
      setSelectedSupplier("");
    } catch (err) {
      alert("Failed to update inventory: " + err.message);
    }
  };

  // Helper: get product list from selected supplier's Firestore object if available, otherwise empty
  const getSupplierProducts = () => {
    if (!selectedSupplier) return [];
    const supplier = suppliers.find((s) => s.name === selectedSupplier);
    return supplier?.products || [];
  };

  const totalPurchaseCost = purchaseItems.reduce(
    (total, item) => total + item.price * item.quantity, 0
  );

  return (
    <div className="min-h-screen bg-[#435355] p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Buy Products & Purchase from Supplier</h1>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={openPurchaseModal}
          className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded font-semibold"
        >
          📦 Buy from Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Master Product Catalogue */}
        <div className="col-span-3 bg-[#012A2D] p-4 rounded shadow overflow-y-auto" style={{ maxHeight: "70vh" }}>
          <h2 className="text-2xl text-yellow-300 mb-4">Master Product Catalogue</h2>
          <ul className="space-y-3">
            {masterProducts.map((prod, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-[#023737] rounded px-4 py-3 cursor-pointer hover:bg-[#034848]"
                onClick={() => addToCart(prod)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{prod.icon || prod.emoji || "📦"}</span>
                  <div>
                    <h3 className="text-white font-semibold">{prod.name}</h3>
                    <p className="text-yellow-400">₹{prod.price}</p>
                  </div>
                </div>
                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">Add</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Cart */}
        <div className="bg-white p-4 rounded shadow flex flex-col" style={{ maxHeight: "70vh" }}>
          <h2 className="text-xl font-bold mb-4 text-[#012A2D]">🛒 Your Cart ({cart.length})</h2>
          {cart.length === 0 ? (
            <p className="text-gray-600">Cart is empty</p>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center mb-3 border-b pb-2">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-700">₹{item.price} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => decreaseQty(item.id)} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQty(item.id)} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold mb-2">Total: ₹{totalBill.toLocaleString("en-IN")}</p>
                <button
                  onClick={clearCart}
                  className="w-full mb-2 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                >
                  🗑️ Clear Cart
                </button>
                <button
  onClick={handleCartPurchase}
  disabled={cart.length === 0}
  className="w-full mb-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
>
  Buy Now
</button>

                {/* Can hook to a "buy and add" handler if needed */}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Supplier Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#435355] rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Purchase from Supplier</h2>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Supplier Selection and Products */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-white">Select Supplier</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full p-3 bg-[#012A2D] rounded-lg text-white border border-gray-600 focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="">Choose a supplier...</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedSupplier && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Available Products</label>
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                      {getSupplierProducts().map((product, idx) => (
                        <button
                          key={idx}
                          onClick={() => addItemToPurchase(product)}
                          className="bg-[#012A2D] p-3 rounded text-sm hover:bg-[#2a3a3c] transition-colors text-white"
                        >
                          {product}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Purchase Items */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Purchase Items</label>
                <div className="bg-[#012A2D] rounded-lg p-4 min-h-[300px]">
                  {purchaseItems.length === 0 ? (
                    <p className="text-gray-400 text-sm">No items selected for purchase</p>
                  ) : (
                    <div className="space-y-3">
                      {purchaseItems.map((item, idx) => (
                        <div key={idx} className="bg-[#435355] p-3 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-white">{item.name}</span>
                            <button
                              onClick={() => removeItemFromPurchase(item.name)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-300">Quantity:</label>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updatePurchaseQuantity(item.name, parseInt(e.target.value) || 0)}
                                className="w-full p-1 bg-[#012A2D] rounded text-white text-sm border border-gray-600"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-300">Price per unit:</label>
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => updatePurchasePrice(item.name, parseFloat(e.target.value) || 0)}
                                className="w-full p-1 bg-[#012A2D] rounded text-white text-sm border border-gray-600"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-300 mt-1">
                            Total: ₹{(item.quantity * item.price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-right">
                  <span className="text-lg font-bold text-white">
                    Total Cost: ₹{totalPurchaseCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            {/* Modal actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSupplierPurchase}
                disabled={!selectedSupplier || purchaseItems.length === 0}
                className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
