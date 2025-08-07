import React, { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";

function formatCurrency(num) {
  return "₹" + num.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function getMonthName(monthIndex) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[monthIndex];
}

export default function AnalyticsPage() {
  const { profile } = useAuth();

  // States
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState(new Set()); // Assuming customer emails as unique IDs
  const [inventory, setInventory] = useState([]);

  // Aggregated stats
  const [monthlySales, setMonthlySales] = useState([]); // [{ month: 'Jan', salesCount: 0, revenue: 0 }]
  const [predictionData, setPredictionData] = useState([]);

  // Chart max value for scaling
  const [maxChartValue, setMaxChartValue] = useState(0);

  useEffect(() => {
    if (!profile?.storeId) return;

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch sales
        const salesCol = collection(db, "stores", profile.storeId, "sales");
        const salesSnap = await getDocs(salesCol);
        const salesData = salesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch orders
        const ordersCol = collection(db, "stores", profile.storeId, "orders");
        const ordersSnap = await getDocs(ordersCol);
        const ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch inventory
        const inventoryCol = collection(db, "stores", profile.storeId, "products");
        const inventorySnap = await getDocs(inventoryCol);
        const inventoryData = inventorySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate customers from sales + orders
        const customerSet = new Set();
        salesData.forEach(s => customerSet.add(s.customer?.toLowerCase() || ""));
        ordersData.forEach(o => customerSet.add(o.customer?.toLowerCase() || ""));

        // Calculate monthly sales & revenue (last 6 months)
        const salesByMonth = Array(6).fill(null).map(() => ({ salesCount: 0, revenue: 0 }));
        const now = new Date();

        salesData.forEach(sale => {
          if (!sale.date) return;
          const [year, monthStr] = sale.date.split("-");
          const month = parseInt(monthStr, 10) - 1;

          const monthDiff = (now.getFullYear() - parseInt(year, 10)) * 12 + (now.getMonth() - month);
          if (monthDiff >=0 && monthDiff < 6) {
            salesByMonth[5 - monthDiff].salesCount += sale.products?.length ?? 0;
            salesByMonth[5 - monthDiff].revenue += sale.total || 0;
          }
        });

        // Prepare monthly data with month names
        const monthlyDataForChart = salesByMonth.map((d, idx) => {
          const dt = new Date(now.getFullYear(), now.getMonth() - 5 + idx);
          return {
            month: getMonthName(dt.getMonth()),
            salesCount: d.salesCount,
            revenue: d.revenue
          };
        });

        // Very simple prediction model: linear increase or last value repeated:
        const lastRevenue = monthlyDataForChart[monthlyDataForChart.length - 1].revenue;
        const predictedData = [];
        for(let i = 1; i <=6; i++) {
            predictedData.push({
                month: getMonthName((now.getMonth() + i) % 12),
                predictedRevenue: lastRevenue * (1 + 0.05 * i), // 5% growth per month
            });
        }

        // Calculate max value for chart scale
        const maxVal = Math.max(
          ...monthlyDataForChart.map(d => d.revenue),
          ...predictedData.map(d => d.predictedRevenue)
        );

        setSales(salesData);
        setOrders(ordersData);
        setInventory(inventoryData);
        setCustomers(customerSet);
        setMonthlySales(monthlyDataForChart);
        setPredictionData(predictedData);
        setMaxChartValue(maxVal);
      } catch (error) {
        console.error("Analytics load error:", error);
      }
      setLoading(false);
    }

    fetchData();
  }, [profile?.storeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#012d3e] text-white">
        <div>Loading analytics...</div>
      </div>
    );
  }

  // Aggregate metrics
  const totalRevenue = sales.reduce((acc, cur) => acc + (cur.total || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.size;
  const totalProductsSold = sales.reduce((acc, cur) => acc + (cur.products?.length || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalInventoryValue = inventory.reduce((acc, item) => acc + ((item.price || 0) * (item.stock || 0)), 0);

  return (
    <div className="min-h-screen bg-[#012d3e] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Analytics & Reports</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            change={+12.5}
            positive
            icon="📈"
          />
          <MetricCard
            title="Total Orders"
            value={totalOrders.toString()}
            change={+8.2}
            positive
            icon="📋"
          />
          <MetricCard
            title="Total Customers"
            value={totalCustomers.toString()}
            change={+15.3}
            positive
            icon="👥"
          />
          <MetricCard
            title="Products Sold"
            value={totalProductsSold.toString()}
            change={-2.1}
            positive={false}
            icon="🛒"
          />
          <MetricCard
            title="Inventory Value"
            value={formatCurrency(totalInventoryValue)}
            icon="🏬"
          />
          <MetricCard
            title="Average Order Value"
            value={formatCurrency(avgOrderValue)}
            icon="💰"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales and Revenue trend */}
          <div className="bg-[#1f3a44] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Sales & Revenue Trend</h2>
            <TrendChart data={monthlySales} valueKey="revenue" maxVal={maxChartValue} />
          </div>
          {/* Revenue prediction */}
          <div className="bg-[#1f3a44] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Prediction</h2>
            <PredictionChart data={predictionData} maxVal={maxChartValue} />
          </div>
        </div>

        {/* Additional Analytics could be added here */}
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, positive = true, icon }) {
  return (
    <div className="bg-[#274559] p-6 rounded-lg flex items-center space-x-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-gray-300">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {change !== undefined && (
          <p className={`text-sm ${positive ? "text-green-400" : "text-red-400"}`}>
            {positive ? "▲" : "▼"} {Math.abs(change)}% vs last month
          </p>
        )}
      </div>
    </div>
  );
}

function TrendChart({ data, valueKey, maxVal }) {
  // Simple bar chart: each bar height proportional to value
  const maxHeight = 120;
  return (
    <div className="flex items-end justify-between h-32 space-x-2">
      {data.map((d, idx) => {
        const val = d[valueKey] || 0;
        const height = (val / maxVal) * maxHeight;
        return (
          <div key={idx} className="flex-1 text-center">
            <div
              className={`mx-auto rounded-t`}
              style={{ height: `${height}px`, width: "60%", backgroundColor: valueKey === "revenue" ? "#10B981" : "#3B82F6" }}
            ></div>
            <div className="text-xs mt-1">{d.month}</div>
          </div>
        );
      })}
    </div>
  );
}

function PredictionChart({ data, maxVal }) {
  const width = 340;
  const height = 150;
  const paddingLeft = 30;
  const paddingBottom = 25;

  // Separate past and predicted data
  const pastData = data.filter(d => d.predictedRevenue === undefined);
  const predictedData = data;

  // Combined points for line
  const points = data.map((d, idx) => {
    const x = paddingLeft + (idx * ((width - paddingLeft) / (data.length - 1)));
    const y = height - (d.predictedRevenue ? d.predictedRevenue : 0) / maxVal * (height - 20);
    return [x, y];
  });

  if (points.length < 1) return null;

  // Construct polyline points string
  const polylinePoints = points.map(p => p.join(",")).join(" ");

  return (
    <svg width={width} height={height} className="mx-auto">
      {/* Axes */}
      <line x1={paddingLeft} y1={height - 20} x2={width} y2={height - 20} stroke="#555" />
      <line x1={paddingLeft} y1={0} x2={paddingLeft} y2={height - 20} stroke="#555" />

      {/* Polyline (prediction) */}
      <polyline
        fill="none"
        stroke="#10B981"
        strokeWidth="3"
        points={polylinePoints}
      />

      {/* Labels */}
      {data.map((d, idx) => {
        const x = paddingLeft + (idx * ((width - paddingLeft) / (data.length - 1)));
        const y = height - 20;
        return (
          <text key={idx} x={x} y={y + 15} fontSize="10" fill="#ccc" textAnchor="middle">
            {d.month}
          </text>
        );
      })}

      {/* Y axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = height - 20 - t * (height - 20);
        return (
          <text key={t} x={5} y={y + 5} fontSize="10" fill="#ccc" textAnchor="start">
            {formatCurrency(maxVal * t)}
          </text>
        );
      })}
    </svg>
  );
}
