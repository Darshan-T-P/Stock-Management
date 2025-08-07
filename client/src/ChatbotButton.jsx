import React, { useState } from "react";

// Replace with your chatbot component import if you have one
// import ChatBotWidget from "./ChatBotWidget";

export default function ChatbotButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed z-50 bottom-6 right-6 bg-[#012A2D] hover:bg-[#02404f] text-white rounded-full shadow-lg flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          fontSize: "2rem",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        }}
        title={open ? "Close chatbot" : "Chat with us"}
      >
        💬
      </button>

      {/* Optional: Chatbot window/modal */}
      {open && (
        <div
          className="fixed z-50 bottom-24 right-8 bg-white border border-gray-200 rounded-lg shadow-lg w-[340px] h-[480px] p-2 flex flex-col"
        >
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-bold text-[#012A2D]">Chat Assistant</span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-800 font-bold">×</button>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {/* Replace this with your actual chatbot widget/component */}
            <div className="text-gray-600 mt-10 text-center">
              Hi! How can I help you?
              <br />
              (Integrate your chatbot here)
            </div>
          </div>
        </div>
      )}
    </>
  );
}
