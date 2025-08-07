import React, { useState } from "react";

export default function LogisticsPage() {
  const [shipments] = useState([
    {
      id: "SHIP-001",
      orderId: "ORD-001",
      customer: "Alice Johnson",
      destination: "New York, NY",
      status: "In Transit",
      carrier: "FedEx",
      trackingNumber: "FDX123456789",
      estimatedDelivery: "2024-01-18",
      items: ["Gaming Laptop", "Gaming Mouse"]
    },
    {
      id: "SHIP-002",
      orderId: "ORD-002",
      customer: "Mike Wilson",
      destination: "Los Angeles, CA",
      status: "Delivered",
      carrier: "UPS",
      trackingNumber: "UPS987654321",
      estimatedDelivery: "2024-01-16",
      items: ["Wireless Headphones"]
    },
    {
      id: "SHIP-003",
      orderId: "ORD-003",
      customer: "Sarah Davis",
      destination: "Chicago, IL",
      status: "Out for Delivery",
      carrier: "USPS",
      trackingNumber: "USPS456789123",
      estimatedDelivery: "2024-01-17",
      items: ["Mechanical Keyboard", "Mouse Pad"]
    }
  ]);

  const [incomingShipments] = useState([
    {
      id: "IN-001",
      supplier: "TechCorp Solutions",
      items: ["Laptops", "Monitors"],
      status: "In Transit",
      estimatedArrival: "2024-01-20",
      carrier: "DHL"
    },
    {
      id: "IN-002",
      supplier: "Global Electronics",
      items: ["Smartphones", "Tablets"],
      status: "Scheduled",
      estimatedArrival: "2024-01-25",
      carrier: "FedEx"
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "In Transit": return "bg-blue-500 text-white";
      case "Delivered": return "bg-green-500 text-white";
      case "Out for Delivery": return "bg-yellow-500 text-black";
      case "Scheduled": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-[#012A2D] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Logistics Management</h1>
        
        {/* Logistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Outgoing Shipments</p>
                <p className="text-2xl font-bold">{shipments.length}</p>
              </div>
              <div className="text-3xl">📤</div>
            </div>
          </div>
          
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Incoming Shipments</p>
                <p className="text-2xl font-bold">{incomingShipments.length}</p>
              </div>
              <div className="text-3xl">📥</div>
            </div>
          </div>
          
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">In Transit</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <div className="text-3xl">🚚</div>
            </div>
          </div>
          
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Delivered Today</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </div>

        {/* Outgoing Shipments */}
        <div className="bg-[#435355] rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-[#012A2D]">
            <h2 className="text-xl font-semibold">Outgoing Shipments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#012A2D]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Shipment ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Destination</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Carrier</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Tracking</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#012A2D]">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-[#012A2D] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{shipment.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium">{shipment.customer}</p>
                        <p className="text-xs text-gray-300">{shipment.orderId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{shipment.destination}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{shipment.carrier}</td>
                    <td className="px-6 py-4 text-sm text-blue-400">{shipment.trackingNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300 text-sm">Track</button>
                        <button className="text-green-400 hover:text-green-300 text-sm">Update</button>
                        <button className="text-yellow-400 hover:text-yellow-300 text-sm">Details</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incoming Shipments */}
        <div className="bg-[#435355] rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-[#012A2D]">
            <h2 className="text-xl font-semibold">Incoming Shipments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#012A2D]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Shipment ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Supplier</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Items</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Carrier</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">ETA</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#012A2D]">
                {incomingShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-[#012A2D] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{shipment.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{shipment.supplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {shipment.items.join(", ")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{shipment.carrier}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{shipment.estimatedArrival}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300 text-sm">Track</button>
                        <button className="text-green-400 hover:text-green-300 text-sm">Receive</button>
                        <button className="text-yellow-400 hover:text-yellow-300 text-sm">Details</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#435355] p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-[#012A2D] rounded-lg hover:bg-[#1a3a3d] transition-colors text-left">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📦</span>
                  <span>Create Shipment</span>
                </div>
              </button>
              <button className="w-full p-3 bg-[#012A2D] rounded-lg hover:bg-[#1a3a3d] transition-colors text-left">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📋</span>
                  <span>Generate Labels</span>
                </div>
              </button>
              <button className="w-full p-3 bg-[#012A2D] rounded-lg hover:bg-[#1a3a3d] transition-colors text-left">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  <span>Shipping Reports</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-[#435355] p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Carrier Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">FedEx</span>
                <span className="text-green-400 text-sm">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">UPS</span>
                <span className="text-green-400 text-sm">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">USPS</span>
                <span className="text-yellow-400 text-sm">Delays</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">DHL</span>
                <span className="text-green-400 text-sm">Operational</span>
              </div>
            </div>
          </div>

          <div className="bg-[#435355] p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Warehouse Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Available Space</span>
                <span className="text-green-400 text-sm">75%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Receipt</span>
                <span className="text-yellow-400 text-sm">12 items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ready to Ship</span>
                <span className="text-blue-400 text-sm">8 items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Staff Available</span>
                <span className="text-green-400 text-sm">5/6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 