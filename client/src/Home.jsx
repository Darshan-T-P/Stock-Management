import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { FaBell, FaSignOutAlt } from "react-icons/fa";

export default function HomePage() {
  const { currentUser, profile, store, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      alert("Failed to log out: " + error.message);
    }
  };

  // Fake dashboard numbers (replace with live data if you want)
  const stats = [
    { label: "Total Sales", value: "₹0" },
    { label: "Products", value: "8" },
    { label: "Orders", value: "0" },
    { label: "System Status", value: "Online" },
  ];

  // Card grid menu (customize with your app's features)
  const cards = [
    {
      title: "Product Management",
      desc: "View, add, or update products.",
      path: "/products-management",
    },
    { title: "Orders", desc: "Track customer orders.", path: "/orders" },
    {
      title: "Analytics & Reports",
      desc: "See business statistics.",
      path: "/reports",
    },
    { title: "Customers", desc: "Manage your clients.", path: "/customers" },
    // Add more cards as needed
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #012A2D, #435355)" }}
    >
      {/* Navbar */}
      <nav className="flex items-center px-6 py-4 bg-[#012A2D] text-white">
        {/* Left side: SimpleShelf title */}
        <div className="flex flex-1 items-center">
          <h1 className="text-xl font-bold font-serif select-none">SimpleShelf</h1>
        </div>

        {/* Center: Store Name */}
        <div className="flex-1 text-center">
          <h2 className="text-lg font-semibold">{store?.storeName || "N/A"}</h2>
        </div>

        {/* Right side: User info + Notification + Logout */}
        <div className="flex flex-1 items-center justify-end space-x-6">

          {/* User name and email */}
          <div className="flex flex-col items-end leading-tight max-w-xs truncate">
            <span className="font-semibold text-sm">{profile?.username || "User"}</span>
            <span className="text-xs opacity-75 truncate">{currentUser?.email}</span>
          </div>

          {/* Notification Icon */}
          <button
            aria-label="Notifications"
            title="Notifications"
            onClick={() => navigate("/notifications")}
            className="relative p-1 hover:text-yellow-400 transition"
          >
            <FaBell size={20} />
            {/* Optional notification badge */}
          </button>

          {/* Logout Icon */}
          <button
            aria-label="Logout"
            title="Logout"
            onClick={handleLogout}
            className="p-1 hover:text-red-500 transition"
          >
            <FaSignOutAlt size={20} />
          </button>
        </div>
      </nav>

      {/* Summary Row */}
      <div className="flex justify-center gap-6 py-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow text-center px-6 py-4 min-w-[150px] border"
            style={{ borderColor: "#012A2D" }}
          >
            <div className="font-bold text-lg text-[#012A2D]">{stat.value}</div>
            <div className="text-gray-700 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-1 px-6 pb-10 gap-8">
        {/* Main Card Grid */}
        <main className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link to={card.path} key={card.title} tabIndex={0}>
              <div
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition border cursor-pointer"
                style={{ borderColor: "#012A2D" }}
              >
                <div className="font-semibold text-[#012A2D] mb-2 text-lg">
                  {card.title}
                </div>
                <div className="text-gray-600">{card.desc}</div>
              </div>
            </Link>
          ))}
        </main>

        {/* Sidebar for About / Notifications */}
        <aside className="hidden md:flex flex-col gap-6 w-72">
          <div
            className="bg-white border rounded-lg shadow p-4"
            style={{ borderColor: "#435355" }}
          >
            <h3 className="font-bold text-[#012A2D] mb-2 text-lg">
              About SimpleShelf
            </h3>
            <p className="text-gray-600 text-sm">
              Smart Inventory & Stock Management Solution. All your business
              statistics and operations—at a glance.
            </p>
          </div>
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg shadow p-4">
            <h4 className="font-bold text-yellow-900 mb-1">Notifications</h4>
            <ul className="text-yellow-900 text-sm space-y-1">
              <li>No new notifications.</li>
              {/* Or: <li>3 orders pending confirmation</li> */}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
