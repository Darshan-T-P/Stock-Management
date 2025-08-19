import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

// Sample data for testing analytics and logistics
export const seedSampleData = async (storeId) => {
  try {
    console.log("Seeding sample data for store:", storeId);

    // Sample sales data
    const salesData = [
      {
        customer: "John Doe",
        date: "2024-01-15",
        total: 1250.00,
        products: ["Gaming Laptop", "Gaming Mouse"],
        status: "completed"
      },
      {
        customer: "Jane Smith",
        date: "2024-01-16",
        total: 850.00,
        products: ["Wireless Headphones"],
        status: "completed"
      },
      {
        customer: "Mike Johnson",
        date: "2024-01-17",
        total: 2100.00,
        products: ["Gaming Laptop", "Mechanical Keyboard", "Mouse Pad"],
        status: "completed"
      },
      {
        customer: "Sarah Wilson",
        date: "2024-01-18",
        total: 450.00,
        products: ["Gaming Mouse"],
        status: "completed"
      },
      {
        customer: "David Brown",
        date: "2024-01-19",
        total: 1800.00,
        products: ["Gaming Laptop", "Gaming Headset"],
        status: "completed"
      }
    ];

    // Sample orders data
    const ordersData = [
      {
        customer: "John Doe",
        total: 1250.00,
        status: "completed",
        createdAt: Timestamp.now(),
        products: ["Gaming Laptop", "Gaming Mouse"]
      },
      {
        customer: "Jane Smith",
        total: 850.00,
        status: "completed",
        createdAt: Timestamp.now(),
        products: ["Wireless Headphones"]
      },
      {
        customer: "Mike Johnson",
        total: 2100.00,
        status: "processing",
        createdAt: Timestamp.now(),
        products: ["Gaming Laptop", "Mechanical Keyboard", "Mouse Pad"]
      },
      {
        customer: "Sarah Wilson",
        total: 450.00,
        status: "shipped",
        createdAt: Timestamp.now(),
        products: ["Gaming Mouse"]
      },
      {
        customer: "David Brown",
        total: 1800.00,
        status: "pending",
        createdAt: Timestamp.now(),
        products: ["Gaming Laptop", "Gaming Headset"]
      }
    ];

    // Sample products data
    const productsData = [
      {
        name: "Gaming Laptop",
        price: 1200.00,
        quantity: 15,
        minQuantity: 5,
        category: "Electronics"
      },
      {
        name: "Gaming Mouse",
        price: 50.00,
        quantity: 8,
        minQuantity: 10,
        category: "Accessories"
      },
      {
        name: "Wireless Headphones",
        price: 850.00,
        quantity: 12,
        minQuantity: 5,
        category: "Audio"
      },
      {
        name: "Mechanical Keyboard",
        price: 150.00,
        quantity: 20,
        minQuantity: 8,
        category: "Accessories"
      },
      {
        name: "Mouse Pad",
        price: 25.00,
        quantity: 30,
        minQuantity: 15,
        category: "Accessories"
      },
      {
        name: "Gaming Headset",
        price: 600.00,
        quantity: 6,
        minQuantity: 5,
        category: "Audio"
      }
    ];

    // Sample customers data
    const customersData = [
      {
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "+1-555-0123",
        address: "123 Main St, New York, NY"
      },
      {
        name: "Jane Smith",
        email: "jane.smith@email.com",
        phone: "+1-555-0124",
        address: "456 Oak Ave, Los Angeles, CA"
      },
      {
        name: "Mike Johnson",
        email: "mike.johnson@email.com",
        phone: "+1-555-0125",
        address: "789 Pine Rd, Chicago, IL"
      },
      {
        name: "Sarah Wilson",
        email: "sarah.wilson@email.com",
        phone: "+1-555-0126",
        address: "321 Elm St, Houston, TX"
      },
      {
        name: "David Brown",
        email: "david.brown@email.com",
        phone: "+1-555-0127",
        address: "654 Maple Dr, Phoenix, AZ"
      }
    ];

    // Sample shipments data
    const shipmentsData = [
      {
        type: "outgoing",
        orderId: "ORD-001",
        customer: "John Doe",
        destination: "New York, NY",
        status: "Delivered",
        carrier: "FedEx",
        trackingNumber: "FDX123456789",
        estimatedDelivery: "2024-01-18",
        items: ["Gaming Laptop", "Gaming Mouse"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        type: "outgoing",
        orderId: "ORD-002",
        customer: "Jane Smith",
        destination: "Los Angeles, CA",
        status: "In Transit",
        carrier: "UPS",
        trackingNumber: "UPS987654321",
        estimatedDelivery: "2024-01-20",
        items: ["Wireless Headphones"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        type: "outgoing",
        orderId: "ORD-003",
        customer: "Mike Johnson",
        destination: "Chicago, IL",
        status: "Scheduled",
        carrier: "USPS",
        trackingNumber: "USPS456789123",
        estimatedDelivery: "2024-01-22",
        items: ["Gaming Laptop", "Mechanical Keyboard", "Mouse Pad"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        type: "incoming",
        supplier: "TechCorp Solutions",
        items: ["Laptops", "Monitors"],
        status: "In Transit",
        estimatedArrival: "2024-01-25",
        carrier: "DHL",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        type: "incoming",
        supplier: "Global Electronics",
        items: ["Smartphones", "Tablets"],
        status: "Scheduled",
        estimatedArrival: "2024-01-28",
        carrier: "FedEx",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    // Add sales data
    const salesRef = collection(db, "stores", storeId, "sales");
    for (const sale of salesData) {
      await addDoc(salesRef, sale);
    }
    console.log("✅ Sales data seeded");

    // Add orders data
    const ordersRef = collection(db, "stores", storeId, "orders");
    for (const order of ordersData) {
      await addDoc(ordersRef, order);
    }
    console.log("✅ Orders data seeded");

    // Add products data
    const productsRef = collection(db, "stores", storeId, "products");
    for (const product of productsData) {
      await addDoc(productsRef, product);
    }
    console.log("✅ Products data seeded");

    // Add customers data
    const customersRef = collection(db, "stores", storeId, "customers");
    for (const customer of customersData) {
      await addDoc(customersRef, customer);
    }
    console.log("✅ Customers data seeded");

    // Add shipments data
    const shipmentsRef = collection(db, "stores", storeId, "shipments");
    for (const shipment of shipmentsData) {
      await addDoc(shipmentsRef, shipment);
    }
    console.log("✅ Shipments data seeded");

    console.log("🎉 All sample data has been seeded successfully!");
    return true;

  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
};

// Function to clear all data (for testing)
export const clearAllData = async (storeId) => {
  try {
    console.log("Clearing all data for store:", storeId);
    
    // Note: This is a destructive operation and should only be used for testing
    // In production, you might want to implement soft delete instead
    
    console.log("⚠️  Data clearing not implemented - use Firebase console to clear data manually");
    return true;
  } catch (error) {
    console.error("Error clearing data:", error);
    throw error;
  }
}; 