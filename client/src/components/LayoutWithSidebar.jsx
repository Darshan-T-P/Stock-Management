import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import ChatbotButton from "../ChatbotButton"; // <-- Import here

export default function LayoutWithSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#435355] relative">
      <div
        className="transition-all duration-300 bg-[#012A2D] h-screen flex-shrink-0"
        style={{ width: collapsed ? "64px" : "224px" }}
      >
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Floating Chatbot Icon */}
      <ChatbotButton />
    </div>
  );
}
