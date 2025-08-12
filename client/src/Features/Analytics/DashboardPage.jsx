import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD", "#5DADE2", "#52BE80",
];

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch inventory products
  useEffect(() => {
    async function fetchInventory() {
      try {
        const productsCol = collection(db, "stores", "wqRy9rJL5u7otgFTMFAs", "products"); // Replace YOUR_STORE_ID dynamically if needed
        const snapshot = await getDocs(productsCol);
        const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(inventory);
      } catch (err) {
        console.error("Failed to fetch products for dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, []);

  // Calculate summary stats
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 20).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + ((p.price ?? 0) * (p.stock ?? 0)), 0);
  const totalRevenuePotential = products.reduce(
    (sum, p) => sum + ((p.sellingPrice ?? p.price ?? 0) * (p.stock ?? 0)),
    0
  );

  // Top 5 popular products by amountSold
  const topProducts = [...products]
    .filter(p => p.amountSold > 0)
    .sort((a, b) => b.amountSold - a.amountSold)
    .slice(0, 5);

  // Data for bar chart: stock levels of top products
  const barChartData = topProducts.map(p => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
    stock: p.stock || 0,
    sold: p.amountSold || 0,
  }));

  // Optional: Pie chart showing stock distribution by category (modify if you have category)
  const categories = {};
  products.forEach(p => {
    const cat = p.category || "Uncategorized";
    categories[cat] = (categories[cat] || 0) + (p.stock || 0);
  });
  const pieChartData = Object.entries(categories).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen p-6 bg-[#012A2D] text-white max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Inventory Dashboard</h1>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-10">
            <SummaryCard title="Total Stock" value={totalStock} icon="📦" />
            <SummaryCard title="Low Stock" value={lowStockCount} icon="⚠️" />
            <SummaryCard title="Out of Stock" value={outOfStockCount} icon="🛑" />
            <SummaryCard title="Total Products" value={totalProducts} icon="📋" />
            <SummaryCard title="Stock Value (₹)" value={totalValue.toLocaleString("en-IN")} icon="💰" />
            <SummaryCard
              title="Potential Revenue (₹)"
              value={totalRevenuePotential.toLocaleString("en-IN")}
              icon="📈"
            />
          </div>

          {/* Top Products Section */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Top 5 Popular Products</h2>
            {topProducts.length === 0 ? (
              <p>No sales data available.</p>
            ) : (
              <ul className="space-y-3">
                {topProducts.map((product) => (
                  <li
                    key={product.id}
                    className="bg-[#023737] p-4 rounded flex justify-between items-center"
                  >
                    <span className="font-medium">{product.name}</span>
                    <span>Sold: {product.amountSold}</span>
                    <span>Stock: {product.stock ?? 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bar Chart - Stock and Sales of Top Products */}
            <div className="bg-[#023737] p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Top Products - Stock vs Sales</h3>
              {barChartData.length === 0 ? (
                <p>No data to display.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" fill="#82ca9d" name="Stock" />
                    <Bar dataKey="sold" fill="#8884d8" name="Sold" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie Chart - Stock Distribution by Category */}
            <div className="bg-[#023737] p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Stock Distribution by Category</h3>
              {pieChartData.length === 0 ? (
                <p>No category data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Summary card component
function SummaryCard({ title, value, icon }) {
  return (
    <div className="bg-[#023737] p-6 rounded shadow text-center flex flex-col items-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-gray-400">{title}</div>
    </div>
  );
}
