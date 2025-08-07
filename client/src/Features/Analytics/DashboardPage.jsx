import React from "react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#012A2D] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Products</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <div className="text-3xl">🛒</div>
            </div>
          </div>
          
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Sales</p>
                <p className="text-2xl font-bold">$45,678</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>
          
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Low Stock Items</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#435355] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#012A2D] rounded">
                <div>
                  <p className="font-medium">Order #1234</p>
                  <p className="text-sm text-gray-300">2 items • $156.00</p>
                </div>
                <span className="text-green-400 text-sm">Completed</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#012A2D] rounded">
                <div>
                  <p className="font-medium">Order #1235</p>
                  <p className="text-sm text-gray-300">1 item • $89.00</p>
                </div>
                <span className="text-yellow-400 text-sm">Pending</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#012A2D] rounded">
                <div>
                  <p className="font-medium">Order #1236</p>
                  <p className="text-sm text-gray-300">3 items • $234.00</p>
                </div>
                <span className="text-blue-400 text-sm">Processing</span>
              </div>
            </div>
          </div>

          <div className="bg-[#435355] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-[#012A2D] rounded-lg hover:bg-[#1a3a3d] transition-colors">
                <div className="text-2xl mb-2">➕</div>
                <p className="text-sm">Add Product</p>
              </button>
              <button className="p-4 bg-[#012A2D] rounded-lg hover:bg-[#1a3a3d] transition-colors">
                <div className="text-2xl mb-2">📋</div>
                <p className="text-sm">New Order</p>
              </button>
              <button className="p-4 bg-[#012A2D] rounded-lg hover:bg-[#1a3a3d] transition-colors">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-sm">View Reports</p>
              </button>
              <button className="p-4 bg-[#012A2D] rounded-lg hover:bg-[#1a3a3d] transition-colors">
                <div className="text-2xl mb-2">⚙️</div>
                <p className="text-sm">Settings</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 