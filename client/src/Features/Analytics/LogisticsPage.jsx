import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogisticsService, formatDate, getStatusColor } from "../../services/analyticsService";
import { FaPlus, FaEdit, FaTrash, FaEye, FaTruck, FaBoxes, FaShippingFast, FaCheckCircle } from "react-icons/fa";

export default function LogisticsPage() {
  const { profile } = useAuth();
  const [logisticsService, setLogisticsService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [outgoingShipments, setOutgoingShipments] = useState([]);
  const [incomingShipments, setIncomingShipments] = useState([]);
  const [logisticsSummary, setLogisticsSummary] = useState({
    outgoingCount: 0,
    incomingCount: 0,
    inTransit: 0,
    delivered: 0,
    scheduled: 0,
    totalShipments: 0
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [newShipment, setNewShipment] = useState({
    type: "outgoing",
    orderId: "",
    customer: "",
    destination: "",
    status: "Scheduled",
    carrier: "",
    trackingNumber: "",
    estimatedDelivery: "",
    items: [],
    supplier: ""
  });

  useEffect(() => {
    if (!profile?.storeId) return;

    const service = new LogisticsService(profile.storeId);
    setLogisticsService(service);

    // Initial data fetch
    fetchLogisticsData(service);

    // Set up real-time subscription
    const unsubscribe = service.subscribeToLogistics((data) => {
      setOutgoingShipments(data.outgoing);
      setIncomingShipments(data.incoming);
      updateLogisticsSummary(data.outgoing, data.incoming);
    });

    return () => unsubscribe();
  }, [profile?.storeId]);

  const fetchLogisticsData = async (service) => {
    try {
      setLoading(true);
      const [outgoing, incoming, summary] = await Promise.all([
        service.getOutgoingShipments(),
        service.getIncomingShipments(),
        service.getLogisticsSummary()
      ]);

      setOutgoingShipments(outgoing);
      setIncomingShipments(incoming);
      setLogisticsSummary(summary);
      setError(null);
    } catch (err) {
      console.error("Error fetching logistics data:", err);
      setError("Failed to load logistics data");
    } finally {
      setLoading(false);
    }
  };

  const updateLogisticsSummary = (outgoing, incoming) => {
    const inTransit = [...outgoing, ...incoming].filter(s => s.status === "In Transit").length;
    const delivered = [...outgoing, ...incoming].filter(s => s.status === "Delivered").length;
    const scheduled = [...outgoing, ...incoming].filter(s => s.status === "Scheduled").length;

    setLogisticsSummary({
      outgoingCount: outgoing.length,
      incomingCount: incoming.length,
      inTransit,
      delivered,
      scheduled,
      totalShipments: outgoing.length + incoming.length
    });
  };

  const handleCreateShipment = async () => {
    try {
      if (!logisticsService) return;

      const shipmentData = {
        ...newShipment,
        items: newShipment.items.filter(item => item.trim() !== "")
      };

      await logisticsService.createShipment(shipmentData);
      setShowCreateModal(false);
      setNewShipment({
        type: "outgoing",
        orderId: "",
        customer: "",
        destination: "",
        status: "Scheduled",
        carrier: "",
        trackingNumber: "",
        estimatedDelivery: "",
        items: [],
        supplier: ""
      });
    } catch (err) {
      console.error("Error creating shipment:", err);
      setError("Failed to create shipment");
    }
  };

  const handleUpdateStatus = async (shipmentId, newStatus) => {
    try {
      if (!logisticsService) return;
      await logisticsService.updateShipmentStatus(shipmentId, newStatus);
    } catch (err) {
      console.error("Error updating shipment status:", err);
      setError("Failed to update shipment status");
    }
  };

  const handleDeleteShipment = async (shipmentId) => {
    if (!window.confirm("Are you sure you want to delete this shipment?")) return;
    
    try {
      if (!logisticsService) return;
      await logisticsService.deleteShipment(shipmentId);
    } catch (err) {
      console.error("Error deleting shipment:", err);
      setError("Failed to delete shipment");
    }
  };

  const addItemField = () => {
    setNewShipment(prev => ({
      ...prev,
      items: [...prev.items, ""]
    }));
  };

  const updateItemField = (index, value) => {
    setNewShipment(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? value : item)
    }));
  };

  const removeItemField = (index) => {
    setNewShipment(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#012A2D] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading logistics data...</p>
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
              onClick={() => fetchLogisticsData(logisticsService)} 
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
          <h1 className="text-3xl font-bold">Logistics Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#435355] hover:bg-[#5a6b6d] px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FaPlus size={16} />
            <span>Create Shipment</span>
          </button>
        </div>
        
        {/* Logistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Outgoing Shipments</p>
                <p className="text-2xl font-bold">{logisticsSummary.outgoingCount}</p>
              </div>
              <FaTruck className="text-3xl text-blue-400" />
            </div>
          </div>
          
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Incoming Shipments</p>
                <p className="text-2xl font-bold">{logisticsSummary.incomingCount}</p>
              </div>
              <FaBoxes className="text-3xl text-green-400" />
            </div>
          </div>
          
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">In Transit</p>
                <p className="text-2xl font-bold">{logisticsSummary.inTransit}</p>
              </div>
              <FaShippingFast className="text-3xl text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-[#435355] p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Delivered Today</p>
                <p className="text-2xl font-bold">{logisticsSummary.delivered}</p>
              </div>
              <FaCheckCircle className="text-3xl text-green-400" />
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
                {outgoingShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-[#012A2D] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{shipment.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium">{shipment.customer || 'N/A'}</p>
                        <p className="text-xs text-gray-300">{shipment.orderId || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{shipment.destination || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={shipment.status}
                        onChange={(e) => handleUpdateStatus(shipment.id, e.target.value)}
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(shipment.status)} border-none outline-none`}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">{shipment.carrier || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-blue-400">{shipment.trackingNumber || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleDeleteShipment(shipment.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {outgoingShipments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                      No outgoing shipments found
                    </td>
                  </tr>
                )}
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
                    <td className="px-6 py-4 text-sm font-medium">{shipment.supplier || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {shipment.items?.join(", ") || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={shipment.status}
                        onChange={(e) => handleUpdateStatus(shipment.id, e.target.value)}
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(shipment.status)} border-none outline-none`}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">{shipment.carrier || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {shipment.estimatedArrival ? formatDate(shipment.estimatedArrival) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleDeleteShipment(shipment.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {incomingShipments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                      No incoming shipments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#435355] p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full p-3 bg-[#012A2D] rounded-lg hover:bg-[#1a3a3d] transition-colors text-left"
              >
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
                <span className="text-yellow-400 text-sm">{logisticsSummary.incomingCount} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ready to Ship</span>
                <span className="text-blue-400 text-sm">{logisticsSummary.outgoingCount} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Staff Available</span>
                <span className="text-green-400 text-sm">5/6</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#435355] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Create New Shipment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Shipment Type</label>
                <select
                  value={newShipment.type}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 rounded bg-[#012A2D] border border-gray-600"
                >
                  <option value="outgoing">Outgoing</option>
                  <option value="incoming">Incoming</option>
                </select>
              </div>

              {newShipment.type === "outgoing" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Order ID</label>
                    <input
                      type="text"
                      value={newShipment.orderId}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, orderId: e.target.value }))}
                      className="w-full p-2 rounded bg-[#012A2D] border border-gray-600"
                      placeholder="Enter order ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Customer</label>
                    <input
                      type="text"
                      value={newShipment.customer}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, customer: e.target.value }))}
                      className="w-full p-2 rounded bg-[#012A2D] border border-gray-600"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Destination</label>
                    <input
                      type="text"
                      value={newShipment.destination}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, destination: e.target.value }))}
                      className="w-full p-2 rounded bg-[#012A2D] border border-gray-600"
                      placeholder="Enter destination"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Supplier</label>
                  <input
                    type="text"
                    value={newShipment.supplier}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full p-2 rounded bg-[#012A2D] border border-gray-600"
                    placeholder="Enter supplier name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Carrier</label>
                <input
                  type="text"
                  value={newShipment.carrier}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, carrier: e.target.value }))}
                  className="w-full p-2 rounded bg-[#012A2D] border border-gray-600"
                  placeholder="Enter carrier name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={newShipment.trackingNumber}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  className="w-full p-2 rounded bg-[#012A2D] border border-gray-600"
                  placeholder="Enter tracking number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estimated Delivery</label>
                <input
                  type="date"
                  value={newShipment.estimatedDelivery}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  className="w-full p-2 rounded bg-[#012A2D] border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Items</label>
                {newShipment.items.map((item, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateItemField(index, e.target.value)}
                      className="flex-1 p-2 rounded bg-[#012A2D] border border-gray-600"
                      placeholder="Enter item name"
                    />
                    <button
                      onClick={() => removeItemField(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addItemField}
                  className="w-full p-2 bg-[#012A2D] hover:bg-[#1a3a3d] rounded border border-gray-600"
                >
                  + Add Item
                </button>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateShipment}
                className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Create Shipment
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 