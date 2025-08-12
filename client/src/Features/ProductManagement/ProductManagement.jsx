import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { ensureProductAndAdjustStock } from "../../utils/ensureProductAndAdjustStock";

// The master product list (every product must have a unique stable id)
const masterProducts = [
  { id: "m1", name: "Rice Bags (25kg)", price: 1200, icon: "🌾" },
  { id: "m2", name: "Cooking Oil (5L)", price: 450, icon: "🛢️" },
  { id: "m3", name: "Sugar (1kg)", price: 42, icon: "🍬" },
  { id: "m4", name: "Wheat Flour (10kg)", price: 380, icon: "🌾" },
  { id: "m5", name: "Dal (Lentils) 1kg", price: 85, icon: "🥗" },
  { id: "m6", name: "Tea Powder (500g)", price: 180, icon: "🍵" },
  { id: "m7", name: "Mustard Oil (1L)", price: 120, icon: "🛢️" },
  { id: "m8", name: "Basmati Rice (5kg)", price: 650, icon: "🍚" },
  { id: "m9", name: "Milk", price: 3.99, icon: "🥛" },
  { id: "m10", name: "Bread", price: 2.49, icon: "🍞" },
  { id: "m11", name: "Eggs", price: 4.99, icon: "🥚" },
  { id: "m12", name: "Apples", price: 1.99, icon: "🍎" },
  { id: "m13", name: "Oranges", price: 2.29, icon: "🍊" },
  { id: "m14", name: "Tomatoes (1kg)", price: 30, icon: "🍅" },
  { id: "m15", name: "Potatoes (1kg)", price: 25, icon: "🥔" },
  // … you can keep adding more
];

export default function ProductManagement() {
  const { profile } = useAuth();

  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState([]);

  // Merge inventory/doc ids for proper product lookup
  useEffect(() => {
    if (!profile?.storeId) return;
    getDocs(collection(db, "stores", profile.storeId, "products")).then(snap => {
      setInventory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [profile?.storeId]);

  // Ensure every cart/purchase item has the right id
  const findProductWithId = (prod) => {
    const inv = inventory.find(p => p.name === prod.name);
    return {
      ...prod,
      id: inv?.id || prod.id, // existing ID if available, else master ID
      amountBought: inv?.amountBought || 0,
    };
  };

  const addToCart = (prod) => {
    const withId = findProductWithId(prod);
    setCart(prev => {
      const ex = prev.find(p => p.id === withId.id);
      return ex
        ? prev.map(p => p.id === withId.id ? { ...p, quantity: p.quantity + 1 } : p)
        : [...prev, { ...withId, quantity: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(p => p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p));
  };

  const clearCart = () => setCart([]);

  // Only difference from cart: can select quantities and prices up front
  const addItemToPurchase = (prod) => {
    const withId = findProductWithId(prod);
    setPurchaseItems(prev => {
      const ex = prev.find(p => p.id === withId.id);
      return ex
        ? prev.map(p => p.id === withId.id ? { ...p, quantity: p.quantity + 1 } : p)
        : [...prev, { ...withId, quantity: 1 }];
    });
  };

  const updatePurchaseQuantity = (id, qty) => {
    setPurchaseItems(prev => prev.map(p => p.id === id ? { ...p, quantity: Math.max(1, qty) } : p));
  };

  const updatePurchasePrice = (id, price) => {
    setPurchaseItems(prev => prev.map(p => p.id === id ? { ...p, price: Math.max(0, price) } : p));
  };

  // UNIVERSAL: use ensureProductAndAdjustStock for both flows!
  const handleCartPurchase = async () => {
    if (!profile?.storeId) {
      alert("Not logged in");
      return;
    }
    if (!cart.length) {
      alert("Cart is empty");
      return;
    }
    try {
      for (const item of cart) {
        await ensureProductAndAdjustStock(profile.storeId, item);
      }
      alert("Cart purchase completed");
      setCart([]);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePurchaseItems = async () => {
    if (!profile?.storeId) return alert("Not logged in");
    if (!purchaseItems.length) return alert("No items to purchase");
    try {
      for (const item of purchaseItems) {
        await ensureProductAndAdjustStock(profile.storeId, item);
      }
      alert("Purchase recorded");
      setPurchaseItems([]);
      setShowPurchaseModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const totalBill = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalPurchaseCost = purchaseItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Merged product list (from inventory or master) for easy selection
  const purchaseList = masterProducts.map(mp => {
    const inv = inventory.find(p => p.name === mp.name);
    return {
      id: inv?.id || mp.id,
      name: mp.name,
      price: inv?.price ?? mp.price,
      amountBought: inv?.amountBought ?? 0,
      icon: mp.icon,
    };
  });

  return (
    <div className="min-h-screen bg-[#435355] p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Product Management</h1>

      {/* Master Catalogue */}
      <section className="mb-6">
        <h2 className="mb-2">Master Product Catalogue</h2>
        <ul className="grid md:grid-cols-3 gap-2">
          {masterProducts.map(mp => (
            <li key={mp.id} className="bg-[#012A2D] p-3 rounded flex justify-between">
              <div>{mp.icon} {mp.name} ₹{mp.price}</div>
              <button onClick={() => addToCart(mp)} className="bg-green-500 px-2 rounded">Add</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Cart */}
      <section className="bg-white text-black p-4 rounded mb-6">
        <h2>Cart ({cart.length})</h2>
        {cart.map(item => (
          <div key={item.id} className="flex justify-between py-1">
            <span>{item.name} ₹{item.price} × {item.quantity}</span>
            <div>
              <button onClick={() => updateCartQty(item.id, -1)}>-</button>
              <button onClick={() => updateCartQty(item.id, 1)}>+</button>
            </div>
          </div>
        ))}
        <p>Total: ₹{totalBill}</p>
        <button onClick={clearCart} className="bg-red-500 px-2 rounded">Clear</button>
        <button onClick={handleCartPurchase} className="bg-green-600 px-2 rounded">Buy Now</button>
      </section>

      {/* Button to open purchase modal */}
      <button onClick={() => setShowPurchaseModal(true)} className="bg-blue-500 px-4 py-2 rounded">➕ Purchase Items</button>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#435355] p-4 rounded w-full max-w-3xl">
            <h2 className="mb-4">Purchase Items</h2>

            {/* Product selection grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {purchaseList.map(prod => (
                <button key={prod.id} onClick={() => addItemToPurchase(prod)} className="bg-[#012A2D] p-2 rounded">
                  {prod.name} ₹{prod.price}
                </button>
              ))}
            </div>

            {/* Selected purchase items */}
            {purchaseItems.map(pi => (
              <div key={pi.id} className="flex justify-between bg-[#023737] p-2 rounded mb-1">
                <span>{pi.name}</span>
                <input type="number" min="1" value={pi.quantity}
                  onChange={e => updatePurchaseQuantity(pi.id, parseInt(e.target.value) || 1)}
                  className="w-12 text-black" />
                <input type="number" min="0" step="0.01" value={pi.price}
                  onChange={e => updatePurchasePrice(pi.id, parseFloat(e.target.value) || 0)}
                  className="w-16 text-black" />
              </div>
            ))}

            {purchaseItems.length > 0 && <p className="mt-2">Total Cost: ₹{totalPurchaseCost}</p>}

            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setShowPurchaseModal(false)}>Cancel</button>
              <button onClick={handlePurchaseItems} className="bg-green-500 px-3 rounded">Complete Purchase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
