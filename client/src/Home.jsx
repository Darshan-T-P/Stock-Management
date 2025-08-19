import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { 
  FaBell, 
  FaSignOutAlt, 
  FaChartLine, 
  FaBoxes, 
  FaShoppingCart, 
  FaUsers, 
  FaTruck, 
  FaWarehouse,
  FaCog,
  FaPlus,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";

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

  // Enhanced dashboard statistics with icons and trends
  const stats = [
    { 
      label: "Total Sales", 
      value: "₹45,280", 
      change: "+12.5%", 
      trend: "up",
      icon: FaChartLine,
      color: "from-green-500 to-emerald-600"
    },
    { 
      label: "Active Products", 
      value: "156", 
      change: "+8", 
      trend: "up",
      icon: FaBoxes,
      color: "from-blue-500 to-cyan-600"
    },
    { 
      label: "Pending Orders", 
      value: "23", 
      change: "-5", 
      trend: "down",
      icon: FaShoppingCart,
      color: "from-orange-500 to-red-600"
    },
    { 
      label: "System Status", 
      value: "Online", 
      change: "99.9%", 
      trend: "stable",
      icon: FaCheckCircle,
      color: "from-green-500 to-teal-600"
    },
  ];

  // Enhanced feature cards with better descriptions and icons
  const featureCards = [
    {
      title: "Product Management",
      desc: "Comprehensive product catalog with advanced inventory tracking",
      path: "/products-management",
      icon: FaBoxes,
      color: "from-blue-600 to-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    { 
      title: "Order Management", 
      desc: "Streamlined order processing and fulfillment tracking", 
      path: "/orders", 
      icon: FaShoppingCart,
      color: "from-green-600 to-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Analytics Dashboard",
      desc: "Real-time insights and performance metrics",
      path: "/analytics",
      icon: FaChartLine,
      color: "from-purple-600 to-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    { 
      title: "Supplier Management", 
      desc: "Manage vendor relationships and procurement", 
      path: "/suppliers", 
      icon: FaTruck,
      color: "from-orange-600 to-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    { 
      title: "Inventory Control", 
      desc: "Smart stock management and reorder automation", 
      path: "/inventory", 
      icon: FaWarehouse,
      color: "from-indigo-600 to-indigo-700",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    },
    { 
      title: "Customer Management", 
      desc: "Centralized customer database and relationship tools", 
      path: "/customers", 
      icon: FaUsers,
      color: "from-pink-600 to-pink-700",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200"
    },
  ];

  // Quick actions for frequently used features
  const quickActions = [
    { title: "Add Product", icon: FaPlus, path: "/products-management", color: "bg-blue-600" },
    { title: "New Order", icon: FaShoppingCart, path: "/orders", color: "bg-green-600" },
    { title: "Check Stock", icon: FaWarehouse, path: "/inventory", color: "bg-purple-600" },
    { title: "Settings", icon: FaCog, path: "/settings", color: "bg-gray-600" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #012A2D, #435355)" }}>
      {/* Enhanced Navbar */}
      <nav className="bg-[#012A2D]/90 backdrop-blur-md border-b border-[#435355]/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#435355] to-[#012A2D] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#435355] to-[#012A2D] bg-clip-text text-transparent">
                  SimpleShelf
                </h1>
                <p className="text-xs text-gray-300">Inventory Management Pro</p>
              </div>
            </div>

            {/* Store Name */}
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">{store?.storeName || "My Store"}</h2>
              <p className="text-sm text-gray-300">Welcome back!</p>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-white">{profile?.username || "User"}</p>
                <p className="text-sm text-gray-300">{currentUser?.email}</p>
              </div>
              
              <button
                onClick={() => navigate("/notifications")}
                className="relative p-3 text-gray-300 hover:text-[#435355] hover:bg-[#435355]/20 rounded-full transition-all duration-200"
              >
                <FaBell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button
                onClick={handleLogout}
                className="p-3 text-gray-300 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all duration-200"
              >
                <FaSignOutAlt size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.username || "User"}! 👋
          </h1>
          <p className="text-gray-300 text-lg">
            Here's what's happening with your business today
          </p>
        </div>

        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => {
            const IconComponent = stat.icon;
            return (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-[#012A2D] to-[#435355] flex items-center justify-center`}>
                    <IconComponent className="text-white" size={20} />
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.trend === "up" ? "bg-green-100 text-green-700" :
                    stat.trend === "down" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action, i) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={i}
                  to={action.path}
                  className="flex items-center space-x-3 px-4 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                >
                  <div className="w-8 h-8 bg-[#012A2D] rounded-lg flex items-center justify-center">
                    <IconComponent className="text-white" size={16} />
                  </div>
                  <span className="font-medium text-white">{action.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feature Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-6">Business Operations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featureCards.map((card, i) => {
                const IconComponent = card.icon;
                return (
                  <Link
                    key={i}
                    to={card.path}
                    className="group block p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#012A2D] to-[#435355] flex items-center justify-center">
                        <IconComponent className="text-white" size={20} />
                      </div>
                      <FaArrowRight className="text-gray-400 group-hover:text-white transition-colors duration-200" size={16} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{card.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaCheckCircle className="text-green-400 mr-2" />
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Database</span>
                  <span className="flex items-center text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">API Services</span>
                  <span className="flex items-center text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Uptime</span>
                  <span className="text-sm text-white font-medium">99.9%</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">New product added</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Order #1234 completed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Low stock alert</span>
                </div>
              </div>
            </div>

            {/* About SimpleShelf */}
            <div className="bg-gradient-to-br from-[#012A2D]/50 to-[#435355]/50 rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">About SimpleShelf</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Your comprehensive inventory management solution designed for modern businesses. 
                Streamline operations, boost efficiency, and make data-driven decisions.
              </p>
              <div className="text-xs text-gray-300">
                <p>• Real-time inventory tracking</p>
                <p>• Advanced analytics & reporting</p>
                <p>• Multi-location support</p>
                <p>• 24/7 system monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
