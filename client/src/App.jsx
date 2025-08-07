import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./Features/Auth/signup";
import Login from "./Features/Auth/login";
import LayoutWithSidebar from "./components/LayoutWithSidebar";
import Home from "./Home";
import NotificationSetup from "./Features/Notification/Notification";
import Inventory from "./Features/Inventory/Inventory";
import SalesManagement from "./Features/ProductManagement/SalesManagement";
import SuppliersPage from "./Features/ProductManagement/SuppliersPage";
import OrdersPage from "./Features/ProductManagement/OrdersPage";
import PurchaseRestock from "./Features/Inventory/PurchaseRestock";
import ProductManagement from "./Features/ProductManagement/ProductManagement";
import DashboardPage from "./Features/Analytics/DashboardPage";
import AnalyticsPage from "./Features/Analytics/AnalyticsPage";
import LogisticsPage from "./Features/Analytics/LogisticsPage";
import ForgotPassword from "./Features/Auth/forgotpassword";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
  {/* Public Routes */}
  <Route path="/" element={<Navigate to="/login" />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />

  {/* Protected routes with sidebar */}
  <Route element={<PrivateRoute><LayoutWithSidebar /></PrivateRoute>}>

    <Route path="/home" element={<Home />} />
    <Route path="/notifications" element={<NotificationSetup />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/inventory" element={<Inventory />} />
    <Route path="/products-management" element={<ProductManagement />} />
    <Route path="/sales" element={<SalesManagement />} />
    <Route path="/purchase-restock" element={<PurchaseRestock />} />
    <Route path="/suppliers" element={<SuppliersPage />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
    <Route path="/logistics" element={<LogisticsPage />} />
    
    {/* Add more protected routes here */}
    <Route path="/orders" element={<OrdersPage />} />
    {/* Add more protected routes here */}
  </Route>
</Routes>

      </AuthProvider>
    </Router>
  );
}

export default App;
