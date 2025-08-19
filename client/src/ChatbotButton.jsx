import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaTimes, FaRobot, FaUser } from "react-icons/fa";

export default function ChatbotButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your SimpleShelf AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Predefined responses for common queries
  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("inventory") || lowerMessage.includes("stock")) {
      return "I can help you with inventory management! You can check stock levels, add new products, or view low stock alerts in the Inventory section.";
    } else if (lowerMessage.includes("order") || lowerMessage.includes("sales")) {
      return "For order management, head to the Orders section where you can track customer orders, process new orders, and view sales history.";
    } else if (lowerMessage.includes("product") || lowerMessage.includes("item")) {
      return "Product management is available in the Products section. You can add, edit, or remove products from your catalog.";
    } else if (lowerMessage.includes("supplier") || lowerMessage.includes("vendor")) {
      return "Supplier management features are in the Suppliers section. You can manage vendor relationships and track procurement.";
    } else if (lowerMessage.includes("analytics") || lowerMessage.includes("report")) {
      return "Business analytics and reports are available in the Analytics section. Get insights into your sales, inventory, and performance metrics.";
    } else if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
      return "I'm here to help! You can ask me about inventory management, orders, products, suppliers, analytics, or any other business operations.";
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! Welcome to SimpleShelf. I'm here to assist you with your inventory management needs.";
    } else {
      return "I understand you're asking about '" + message + "'. For specific assistance, please check the relevant section in the main menu, or ask me about inventory, orders, products, suppliers, or analytics.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(inputMessage),
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chatbot Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed z-50 bottom-6 right-6 bg-gradient-to-r from-[#012A2D] to-[#435355] hover:from-[#02404f] hover:to-[#435355] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          width: 64,
          height: 64,
          boxShadow: "0 8px 32px rgba(1, 42, 45, 0.3)",
        }}
        title={open ? "Close chatbot" : "Chat with AI Assistant"}
      >
        {open ? <FaTimes size={24} /> : <FaRobot size={24} />}
      </button>

      {/* Chatbot Window */}
      {open && (
        <div className="fixed z-50 bottom-24 right-8 bg-white border border-gray-200 rounded-2xl shadow-2xl w-[380px] h-[520px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#012A2D] to-[#435355] text-white p-4 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FaRobot size={20} />
                <div>
                  <span className="font-bold text-lg">AI Assistant</span>
                  <div className="text-xs text-gray-200">SimpleShelf Support</div>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="text-white hover:text-gray-200 transition-colors duration-200"
              >
                <FaTimes size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-[#012A2D] to-[#435355] text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === "bot" && (
                        <FaRobot size={16} className="text-[#012A2D] mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm">{message.text}</div>
                        <div className={`text-xs mt-2 ${
                          message.sender === "user" ? "text-gray-200" : "text-gray-500"
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                      {message.sender === "user" && (
                        <FaUser size={16} className="text-gray-200 mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <FaRobot size={16} className="text-[#012A2D]" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#012A2D] focus:border-transparent"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-3 bg-gradient-to-r from-[#012A2D] to-[#435355] text-white rounded-xl hover:from-[#02404f] hover:to-[#435355] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {["Inventory Help", "Order Support", "Product Info", "Analytics"].map((quickAction) => (
                <button
                  key={quickAction}
                  onClick={() => {
                    setInputMessage(quickAction);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
                >
                  {quickAction}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
