import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
} from "react-icons/fi";
import {
  FaHome,
  FaChartBar,
  FaBoxOpen,
  FaBoxes,
  FaShoppingCart,
  FaClipboardList,
  FaTruck,
  FaUsers,
  FaChartLine,
  FaWarehouse,
  FaBell,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { currentUser } = useAuth();
  const toggleSidebar = () => setCollapsed(!collapsed);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }
    const notificationsRef = collection(db, "users", currentUser.uid, "notifications");
    const q = query(notificationsRef, where("read", "==", false));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const iconMap = {
    home: <FaHome />,
    dashboard: <FaChartBar />,
    productsManagement: <FaBoxOpen />,
    inventory: <FaBoxes />,
    purchaseRestock: <FaShoppingCart />,
    sales: <FaClipboardList />,
    orders: <FaClipboardList />,
    suppliers: <FaTruck />,
    analytics: <FaChartLine />,
    logistics: <FaWarehouse />,
    notifications: <FaBell />,
  };

  const menuItems = [
    { path: "/home", label: "Home", icon: iconMap.home },
    { path: "/dashboard", label: "Dashboard", icon: iconMap.dashboard },
    { path: "/products-management", label: "Products", icon: iconMap.productsManagement },
    { path: "/inventory", label: "Inventory", icon: iconMap.inventory },
    // { path: "/purchase-restock", label: "Restock", icon: iconMap.purchaseRestock },
    { path: "/sales", label: "Sales", icon: iconMap.sales },
    { path: "/orders", label: "Orders", icon: iconMap.orders },
    { path: "/suppliers", label: "Suppliers", icon: iconMap.suppliers },
    { path: "/analytics", label: "Analytics", icon: iconMap.analytics },
    { path: "/logistics", label: "Logistics", icon: iconMap.logistics },
    { path: "/notifications", label: "Notifications", icon: iconMap.notifications },
  ];

  return (
    <div
      className={`h-screen flex flex-col bg-[#012A2D] text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      } overflow-hidden`}
    >
      {/* Toggle + Logo */}
      <div className="flex items-center justify-between p-4 border-b border-[#233333]">
        {/* Toggle Button as IM logo, always visible, clickable to toggle */}
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Open Sidebar" : "Close Sidebar"}
          className="flex items-center justify-center w-10 h-10 bg-yellow-400 rounded-full text-black font-bold select-none focus:outline-none focus:ring-2 focus:ring-yellow-300 hover:bg-yellow-300 transition"
        >
          SS
        </button>

        {/* Chevron toggle only visible when expanded */}
        {!collapsed && (
          <button
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="p-2 rounded hover:bg-[#233333] transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
            title="Collapse Sidebar"
          >
            <FiChevronLeft className="text-xl" />
          </button>
        )}
      </div>

      {/* Menu Links */}
      <nav className="mt-4 flex flex-col gap-2 flex-grow overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/"); // support nested active
          const showBadge = item.path === "/notifications" && unreadCount > 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-md transition-colors duration-200 truncate ${
                isActive ? "bg-[#435355]" : "hover:bg-[#233333]"
              }`}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className="text-xl flex-shrink-0 min-w-[1.25rem] flex justify-center"
                aria-hidden="true"
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="flex items-center justify-between w-full">
                  <span className="truncate">{item.label}</span>
                  {showBadge && (
                    <span
                      className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
                      title={`${unreadCount} new notifications`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
