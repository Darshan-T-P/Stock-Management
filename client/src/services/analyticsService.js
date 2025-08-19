import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  limit, 
  where, 
  Timestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";

// Analytics Service
export class AnalyticsService {
  constructor(storeId) {
    this.storeId = storeId;
  }

  // Fetch sales data
  async getSalesData(limitCount = 100) {
    try {
      const salesRef = collection(db, "stores", this.storeId, "sales");
      const q = query(salesRef, orderBy("date", "desc"), limit(limitCount));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching sales data:", error);
      throw error;
    }
  }

  // Fetch orders data
  async getOrdersData(limitCount = 100) {
    try {
      const ordersRef = collection(db, "stores", this.storeId, "orders");
      const q = query(ordersRef, orderBy("createdAt", "desc"), limit(limitCount));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching orders data:", error);
      throw error;
    }
  }

  // Fetch products/inventory data
  async getInventoryData() {
    try {
      const productsRef = collection(db, "stores", this.storeId, "products");
      const snapshot = await getDocs(productsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      throw error;
    }
  }

  // Fetch customers data
  async getCustomersData() {
    try {
      const customersRef = collection(db, "stores", this.storeId, "customers");
      const snapshot = await getDocs(customersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching customers data:", error);
      throw error;
    }
  }

  // Get monthly analytics
  async getMonthlyAnalytics(months = 6) {
    try {
      const salesData = await this.getSalesData(1000);
      const now = new Date();
      const monthlyData = Array(months).fill(null).map(() => ({ 
        salesCount: 0, 
        revenue: 0, 
        orderCount: 0 
      }));

      salesData.forEach(sale => {
        if (!sale.date) return;
        const [year, monthStr] = sale.date.split("-");
        const month = parseInt(monthStr, 10) - 1;
        const monthDiff = (now.getFullYear() - parseInt(year, 10)) * 12 + (now.getMonth() - month);
        
        if (monthDiff >= 0 && monthDiff < months) {
          monthlyData[months - 1 - monthDiff].salesCount += sale.products?.length ?? 0;
          monthlyData[months - 1 - monthDiff].revenue += sale.total || 0;
          monthlyData[months - 1 - monthDiff].orderCount += 1;
        }
      });

      return monthlyData.map((data, idx) => {
        const dt = new Date(now.getFullYear(), now.getMonth() - months + 1 + idx);
        return {
          month: dt.toLocaleString('default', { month: 'short' }),
          year: dt.getFullYear(),
          salesCount: data.salesCount,
          revenue: data.revenue,
          orderCount: data.orderCount
        };
      });
    } catch (error) {
      console.error("Error calculating monthly analytics:", error);
      throw error;
    }
  }

  // Get dashboard summary
  async getDashboardSummary() {
    try {
      const [sales, orders, inventory, customers] = await Promise.all([
        this.getSalesData(1000),
        this.getOrdersData(1000),
        this.getInventoryData(),
        this.getCustomersData()
      ]);

      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const totalOrders = orders.length;
      const totalProducts = inventory.length;
      const totalCustomers = customers.length;
      const lowStockProducts = inventory.filter(product => (product.quantity || 0) <= (product.minQuantity || 5));

      return {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        lowStockProducts: lowStockProducts.length,
        recentSales: sales.slice(0, 5),
        recentOrders: orders.slice(0, 5)
      };
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      throw error;
    }
  }

  // Real-time analytics subscription
  subscribeToAnalytics(callback) {
    const salesRef = collection(db, "stores", this.storeId, "sales");
    const ordersRef = collection(db, "stores", this.storeId, "orders");
    
    const unsubscribeSales = onSnapshot(salesRef, (snapshot) => {
      const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback({ type: 'sales', data: sales });
    });

    const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback({ type: 'orders', data: orders });
    });

    return () => {
      unsubscribeSales();
      unsubscribeOrders();
    };
  }
}

// Logistics Service
export class LogisticsService {
  constructor(storeId) {
    this.storeId = storeId;
  }

  // Fetch outgoing shipments - simplified query to avoid indexing issues
  async getOutgoingShipments() {
    try {
      const shipmentsRef = collection(db, "stores", this.storeId, "shipments");
      // Remove complex query that requires composite index
      const snapshot = await getDocs(shipmentsRef);
      const shipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter outgoing shipments in memory instead of in query
      const outgoing = shipments.filter(shipment => shipment.type === "outgoing");
      
      // Sort by createdAt in memory if available
      return outgoing.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });
    } catch (error) {
      console.error("Error fetching outgoing shipments:", error);
      throw error;
    }
  }

  // Fetch incoming shipments - simplified query to avoid indexing issues
  async getIncomingShipments() {
    try {
      const shipmentsRef = collection(db, "stores", this.storeId, "shipments");
      // Remove complex query that requires composite index
      const snapshot = await getDocs(shipmentsRef);
      const shipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter incoming shipments in memory instead of in query
      const incoming = shipments.filter(shipment => shipment.type === "incoming");
      
      // Sort by createdAt in memory if available
      return incoming.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });
    } catch (error) {
      console.error("Error fetching incoming shipments:", error);
      throw error;
    }
  }

  // Create new shipment
  async createShipment(shipmentData) {
    try {
      const shipmentsRef = collection(db, "stores", this.storeId, "shipments");
      const shipment = {
        ...shipmentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: shipmentData.status || "Scheduled"
      };
      const docRef = await addDoc(shipmentsRef, shipment);
      return { id: docRef.id, ...shipment };
    } catch (error) {
      console.error("Error creating shipment:", error);
      throw error;
    }
  }

  // Update shipment status
  async updateShipmentStatus(shipmentId, status, additionalData = {}) {
    try {
      const shipmentRef = doc(db, "stores", this.storeId, "shipments", shipmentId);
      await updateDoc(shipmentRef, {
        status,
        updatedAt: Timestamp.now(),
        ...additionalData
      });
      return true;
    } catch (error) {
      console.error("Error updating shipment status:", error);
      throw error;
    }
  }

  // Delete shipment
  async deleteShipment(shipmentId) {
    try {
      const shipmentRef = doc(db, "stores", this.storeId, "shipments", shipmentId);
      await deleteDoc(shipmentRef);
      return true;
    } catch (error) {
      console.error("Error deleting shipment:", error);
      throw error;
    }
  }

  // Get logistics summary
  async getLogisticsSummary() {
    try {
      const [outgoing, incoming] = await Promise.all([
        this.getOutgoingShipments(),
        this.getIncomingShipments()
      ]);

      const inTransit = [...outgoing, ...incoming].filter(s => s.status === "In Transit").length;
      const delivered = [...outgoing, ...incoming].filter(s => s.status === "Delivered").length;
      const scheduled = [...outgoing, ...incoming].filter(s => s.status === "Scheduled").length;

      return {
        outgoingCount: outgoing.length,
        incomingCount: incoming.length,
        inTransit,
        delivered,
        scheduled,
        totalShipments: outgoing.length + incoming.length
      };
    } catch (error) {
      console.error("Error fetching logistics summary:", error);
      throw error;
    }
  }

  // Real-time logistics subscription - simplified to avoid indexing issues
  subscribeToLogistics(callback) {
    const shipmentsRef = collection(db, "stores", this.storeId, "shipments");
    
    return onSnapshot(shipmentsRef, (snapshot) => {
      const shipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter and sort in memory instead of in query
      const outgoing = shipments
        .filter(s => s.type === "outgoing")
        .sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          }
          return 0;
        });
      
      const incoming = shipments
        .filter(s => s.type === "incoming")
        .sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          }
          return 0;
        });
      
      callback({ outgoing, incoming, all: shipments });
    });
  }
}

// Utility functions
export const formatCurrency = (amount) => {
  return "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });
};

export const formatDate = (date) => {
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString();
  }
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  }
  return date.toLocaleDateString();
};

export const getStatusColor = (status) => {
  switch (status) {
    case "In Transit": return "bg-blue-500 text-white";
    case "Delivered": return "bg-green-500 text-white";
    case "Out for Delivery": return "bg-yellow-500 text-black";
    case "Scheduled": return "bg-gray-500 text-white";
    case "Pending": return "bg-orange-500 text-white";
    case "Cancelled": return "bg-red-500 text-white";
    default: return "bg-gray-500 text-white";
  }
}; 