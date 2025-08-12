import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import ChatbotButton from "../ChatbotButton"; // <-- Import here

export default function LayoutWithSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#435355] relative">
      {/* Sidebar - fixed, full height */}
      <div
        className="transition-all duration-300 bg-[#012A2D] h-screen flex-shrink-0 fixed top-0 left-0"
        style={{ width: collapsed ? "64px" : "224px" }}
      >
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main content - scrollable */}
      <main
        className="flex-1 ml-[224px] transition-all duration-300 overflow-y-auto h-screen"
        style={{ marginLeft: collapsed ? "64px" : "224px" }}
      >
        <Outlet />
      </main>

      {/* Floating Chatbot Icon */}
      <ChatbotButton />
    </div>
  );
}
