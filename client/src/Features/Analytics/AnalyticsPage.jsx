import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AnalyticsService, formatCurrency } from "../../services/analyticsService";
import { seedSampleData } from "../../utils/seedData";
import { FaChartLine, FaDollarSign, FaShoppingCart, FaUsers, FaBoxes, FaDatabase } from "react-icons/fa";

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const [analyticsService, setAnalyticsService] = useState(null);

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    recentSales: [],
    recentOrders: []
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);

  useEffect(() => {
    if (!profile?.storeId) return;

    const service = new AnalyticsService(profile.storeId);
    setAnalyticsService(service);

    // Initial data fetch
    fetchDashboardData(service);
    fetchMonthlyData(service);

    // Set up real-time subscription
    const unsubscribe = service.subscribeToAnalytics((update) => {
      if (update.type === 'sales' || update.type === 'orders') {
        fetchDashboardData(service);
        fetchMonthlyData(service);
      }
    });

    return () => unsubscribe();
  }, [profile?.storeId]);

  const fetchDashboardData = async (service) => {
    try {
      setLoading(true);
      const data = await service.getDashboardSummary();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async (service) => {
    try {
      const data = await service.getMonthlyAnalytics(6);
      setMonthlyData(data);

      // Generate prediction data
      const lastRevenue = data[data.length - 1]?.revenue || 0;
      const predictedData = [];
      const now = new Date();
      
      for (let i = 1; i <= 6; i++) {
        const futureDate = new Date(now.getFullYear(), now.getMonth() + i);
        predictedData.push({
          month: futureDate.toLocaleString('default', { month: 'short' }),
          year: futureDate.getFullYear(),
          predictedRevenue: lastRevenue * (1 + 0.05 * i), // 5% growth per month
        });
      }
      setPredictionData(predictedData);
    } catch (err) {
      console.error("Error fetching monthly data:", err);
    }
  };

  const handleSeedData = async () => {
    if (!profile?.storeId) return;
    
    try {
      setSeeding(true);
      await seedSampleData(profile.storeId);
      
      // Refresh data after seeding
      if (analyticsService) {
        await fetchDashboardData(analyticsService);
        await fetchMonthlyData(analyticsService);
      }
      
      alert("Sample data seeded successfully! The dashboard should now show sample analytics.");
    } catch (err) {
      console.error("Error seeding data:", err);
      alert("Failed to seed sample data. Check console for details.");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#012A2D] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#012A2D] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-600 p-4 rounded-lg">
            <p className="text-center">{error}</p>
            <button 
              onClick={() => fetchDashboardData(analyticsService)} 
              className="mt-2 bg-white text-red-600 px-4 py-2 rounded hover:bg-gray-100"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#012A2D] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          
          {/* Seed Data Button - Only show if no data exists */}
          {dashboardData.totalRevenue === 0 && dashboardData.totalOrders === 0 && (
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="bg-[#435355] hover:bg-[#5a6b6d] px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <FaDatabase size={16} />
              <span>{seeding ? "Seeding..." : "Seed Sample Data"}</span>
            </button>
          )}
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboardData.totalRevenue)}</p>
              </div>
              <FaDollarSign className="text-3xl text-green-400" />
            </div>
          </div>
          
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Orders</p>
                <p className="text-2xl font-bold">{dashboardData.totalOrders}</p>
              </div>
              <FaShoppingCart className="text-3xl text-blue-400" />
            </div>
          </div>
          
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Products</p>
                <p className="text-2xl font-bold">{dashboardData.totalProducts}</p>
              </div>
              <FaBoxes className="text-3xl text-purple-400" />
            </div>
          </div>
          
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Customers</p>
                <p className="text-2xl font-bold">{dashboardData.totalCustomers}</p>
              </div>
              <FaUsers className="text-3xl text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-[#435355] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Monthly Revenue Trend</h2>
          <div className="grid grid-cols-6 gap-4">
            {monthlyData.map((month, index) => (
              <div key={index} className="text-center">
                <div className="bg-[#012A2D] p-3 rounded-lg mb-2">
                  <div className="text-sm text-gray-300">{month.month}</div>
                  <div className="text-lg font-bold">{formatCurrency(month.revenue)}</div>
                  <div className="text-xs text-gray-400">{month.orderCount} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Prediction */}
        <div className="bg-[#435355] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FaChartLine className="mr-2 text-green-400" />
            Revenue Prediction (Next 6 Months)
          </h2>
          <div className="grid grid-cols-6 gap-4">
            {predictionData.map((month, index) => (
              <div key={index} className="text-center">
                <div className="bg-[#012A2D] p-3 rounded-lg mb-2 border-l-4 border-green-400">
                  <div className="text-sm text-gray-300">{month.month}</div>
                  <div className="text-lg font-bold text-green-400">{formatCurrency(month.predictedRevenue)}</div>
                  <div className="text-xs text-gray-400">Predicted</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Sales */}
          <div className="bg-[#435355] rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
            <div className="space-y-3">
              {dashboardData.recentSales.map((sale, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-[#012A2D] rounded-lg">
                  <div>
                    <p className="font-medium">{sale.customer || 'Unknown Customer'}</p>
                    <p className="text-sm text-gray-300">{sale.products?.length || 0} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(sale.total || 0)}</p>
                    <p className="text-sm text-gray-300">{sale.date || 'No date'}</p>
                  </div>
                </div>
              ))}
              {dashboardData.recentSales.length === 0 && (
                <p className="text-gray-400 text-center py-4">No recent sales data</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-[#435355] rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {dashboardData.recentOrders.map((order, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-[#012A2D] rounded-lg">
                  <div>
                    <p className="font-medium">{order.customer || 'Unknown Customer'}</p>
                    <p className="text-sm text-gray-300">{order.status || 'Pending'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(order.total || 0)}</p>
                    <p className="text-sm text-gray-300">{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'No date'}</p>
                  </div>
                </div>
              ))}
              {dashboardData.recentOrders.length === 0 && (
                <p className="text-gray-400 text-center py-4">No recent orders data</p>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {dashboardData.lowStockProducts > 0 && (
          <div className="bg-yellow-600 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold mb-2">⚠️ Low Stock Alert</h3>
            <p className="text-yellow-100">
              You have {dashboardData.lowStockProducts} products with low stock levels. 
              Consider restocking to avoid stockouts.
            </p>
          </div>
        )}

        {/* No Data Message */}
        {dashboardData.totalRevenue === 0 && dashboardData.totalOrders === 0 && (
          <div className="bg-[#435355] rounded-lg p-8 mt-8 text-center">
            <FaDatabase className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Analytics Data Available</h3>
            <p className="text-gray-300 mb-4">
              Your analytics dashboard is empty. Click the "Seed Sample Data" button above to populate it with sample data for testing.
            </p>
            <p className="text-sm text-gray-400">
              In a real application, this data would come from your actual sales, orders, and inventory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
