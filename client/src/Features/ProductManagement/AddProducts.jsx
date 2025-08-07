import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";

export default function Inventory() {
  const { profile } = useAuth(); // to get storeId of user
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile?.storeId) return;

    const fetchProducts = async () => {
      try {
        const productsCol = collection(db, "stores", profile.storeId, "products");
        const snapshot = await getDocs(productsCol);
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, [profile]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.category || !form.price || !form.stock) {
      setError("All fields are required!");
      return;
    }

    if (isNaN(form.price) || isNaN(form.stock) || form.price <= 0 || form.stock < 0) {
      setError("Please enter valid positive numbers for price and stock.");
      return;
    }

    setLoading(true);

    try {
      const productsCol = collection(db, "stores", profile.storeId, "products");
      const newProduct = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        createdAt: new Date(),
      };

      const docRef = await addDoc(productsCol, newProduct);

      setProducts(prev => [...prev, { id: docRef.id, ...newProduct }]);
      setForm({ name: "", category: "", price: "", stock: "" });
    } catch (err) {
      setError("Failed to add product: " + err.message);
    }

    setLoading(false);
  };


  return (
    <div className="p-6 bg-[#223333] min-h-screen text-white">
      <h2 className="text-2xl mb-4">Inventory Management</h2>

      {/* Add New Product Form */}
      <form onSubmit={handleAddProduct} className="mb-6 bg-[#335555] p-4 rounded shadow space-y-3 max-w-md">
        <h3 className="font-semibold text-lg">Add New Product</h3>
        <input className="w-full p-2 rounded text-black" name="name" placeholder="Product Name" value={form.name} onChange={handleChange} />
        <input className="w-full p-2 rounded text-black" name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input className="w-full p-2 rounded text-black" name="price" type="number" placeholder="Price (₹)" min="0" value={form.price} onChange={handleChange} />
        <input className="w-full p-2 rounded text-black" name="stock" type="number" placeholder="Stock Quantity" min="0" value={form.stock} onChange={handleChange} />

        {error && <p className="text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      {/* Existing products list (similar to your existing table/cards)... */}
      <div>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <ul className="grid grid-cols-4 gap-4">
            {products.map(p => (
              <li key={p.id} className="bg-[#114444] p-3 rounded shadow text-center">
                <h4 className="font-semibold mb-1">{p.name}</h4>
                <p>Category: {p.category}</p>
                <p>Price: ₹{p.price}</p>
                <p>Stock: {p.stock}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
