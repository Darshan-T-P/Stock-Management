import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

// Generate sample notifications for testing
export const generateSampleNotifications = async (userId) => {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications");
    
    const sampleNotifications = [
      {
        title: "Low Stock Alert",
        body: "Gaming Mouse is running low on stock. Current quantity: 8 units. Consider restocking soon.",
        type: "warning",
        priority: "high",
        read: false,
        createdAt: Timestamp.now(),
        category: "inventory"
      },
      {
        title: "Order Completed",
        body: "Order #ORD-001 has been successfully delivered to John Doe. Total: ₹1,250.00",
        type: "success",
        priority: "medium",
        read: false,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
        category: "orders"
      },
      {
        title: "New Customer Registration",
        body: "Sarah Wilson has registered as a new customer. Email: sarah.wilson@email.com",
        type: "info",
        priority: "low",
        read: true,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)), // 6 hours ago
        readAt: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000)), // 5 hours ago
        category: "customers"
      },
      {
        title: "Shipment Update",
        body: "Shipment SHIP-002 is now out for delivery. Expected delivery: Today by 6 PM",
        type: "info",
        priority: "medium",
        read: false,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 60 * 60 * 1000)), // 1 hour ago
        category: "logistics"
      },
      {
        title: "System Maintenance",
        body: "Scheduled maintenance will occur tonight from 2 AM to 4 AM. Minimal downtime expected.",
        type: "info",
        priority: "low",
        read: true,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000)), // 12 hours ago
        readAt: Timestamp.fromDate(new Date(Date.now() - 11 * 60 * 60 * 1000)), // 11 hours ago
        category: "system"
      },
      {
        title: "Revenue Milestone",
        body: "Congratulations! You've reached ₹50,000 in monthly revenue. Keep up the great work!",
        type: "success",
        priority: "medium",
        read: false,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000)), // 30 minutes ago
        category: "analytics"
      },
      {
        title: "Supplier Payment Due",
        body: "Payment of ₹15,000 is due to TechCorp Solutions in 3 days. Please process payment.",
        type: "warning",
        priority: "high",
        read: false,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)), // 4 hours ago
        category: "finance"
      },
      {
        title: "Inventory Audit Reminder",
        body: "Monthly inventory audit is due in 2 days. Please review and update stock levels.",
        type: "info",
        priority: "medium",
        read: true,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 8 * 60 * 60 * 1000)), // 8 hours ago
        readAt: Timestamp.fromDate(new Date(Date.now() - 7 * 60 * 60 * 1000)), // 7 hours ago
        category: "inventory"
      }
    ];

    // Add notifications to Firebase
    for (const notification of sampleNotifications) {
      await addDoc(notificationsRef, notification);
    }

    console.log("✅ Sample notifications generated successfully!");
    return true;

  } catch (error) {
    console.error("Error generating sample notifications:", error);
    throw error;
  }
};

// Clear all notifications
export const clearAllNotifications = async (userId) => {
  try {
    const notificationsRef = collection(db, "users", userId, "notifications");
    const snapshot = await getDocs(notificationsRef);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log("✅ All notifications cleared successfully!");
    return true;

  } catch (error) {
    console.error("Error clearing notifications:", error);
    throw error;
  }
};

// Get notification statistics
export const getNotificationStats = (notifications) => {
  const total = notifications.length;
  const unread = notifications.filter(n => !n.read).length;
  const read = notifications.filter(n => n.read).length;
  
  // Count by type
  const byType = notifications.reduce((acc, n) => {
    acc[n.type || 'default'] = (acc[n.type || 'default'] || 0) + 1;
    return acc;
  }, {});
  
  // Count by priority
  const byPriority = notifications.reduce((acc, n) => {
    acc[n.priority || 'default'] = (acc[n.priority || 'default'] || 0) + 1;
    return acc;
  }, {});
  
  // Count by category
  const byCategory = notifications.reduce((acc, n) => {
    acc[n.category || 'general'] = (acc[n.category || 'general'] || 0) + 1;
    return acc;
  }, {});
  
  return {
    total,
    unread,
    read,
    byType,
    byPriority,
    byCategory
  };
};

// Format notification timestamp for display
export const formatNotificationTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

// Get notification icon based on type and priority
export const getNotificationIcon = (type, priority = 'medium') => {
  const iconSize = priority === 'high' ? 24 : 20;
  
  switch (type) {
    case 'warning':
      return { icon: 'FaExclamationTriangle', color: 'text-yellow-500', size: iconSize };
    case 'success':
      return { icon: 'FaCheckCircle', color: 'text-green-500', size: iconSize };
    case 'error':
      return { icon: 'FaExclamationCircle', color: 'text-red-500', size: iconSize };
    case 'info':
      return { icon: 'FaInfoCircle', color: 'text-blue-500', size: iconSize };
    default:
      return { icon: 'FaBell', color: 'text-gray-500', size: iconSize };
  }
};

// Get priority color scheme
export const getPriorityColors = (priority) => {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-red-50',
        border: 'border-l-red-500',
        text: 'text-red-700',
        badge: 'bg-red-500 text-white'
      };
    case 'medium':
      return {
        bg: 'bg-yellow-50',
        border: 'border-l-yellow-500',
        text: 'text-yellow-700',
        badge: 'bg-yellow-500 text-black'
      };
    case 'low':
      return {
        bg: 'bg-blue-50',
        border: 'border-l-blue-500',
        text: 'text-blue-700',
        badge: 'bg-blue-500 text-white'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-l-gray-500',
        text: 'text-gray-700',
        badge: 'bg-gray-500 text-white'
      };
  }
}; 