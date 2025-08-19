// src/Features/Notification/NotificationPage.jsx
import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import { generateSampleNotifications } from "../../utils/notificationUtils";
import { 
  FaBell, 
  FaCheck, 
  FaTrash, 
  FaEye, 
  FaEyeSlash, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaClock,
  FaFilter,
  FaSearch,
  FaDatabase
} from "react-icons/fa";

export default function NotificationPage() {
  const { currentUser, profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const notificationsQuery = query(
      collection(db, "users", currentUser.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notiData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notiData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Mark notification as read
  const markAsRead = async (id) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "users", currentUser.uid, "notifications", id), {
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark notification as unread
  const markAsUnread = async (id) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "users", currentUser.uid, "notifications", id), {
        read: false,
        readAt: null
      });
    } catch (error) {
      console.error("Error marking notification as unread:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    if (!currentUser) return;
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteDoc(doc(db, "users", currentUser.uid, "notifications", id));
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!currentUser) return;
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification =>
          updateDoc(doc(db, "users", currentUser.uid, "notifications", notification.id), {
            read: true,
            readAt: new Date()
          })
        )
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Generate sample notifications
  const handleGenerateSamples = async () => {
    if (!currentUser) return;
    
    try {
      setGenerating(true);
      await generateSampleNotifications(currentUser.uid);
      alert("Sample notifications generated successfully! Refresh the page to see them.");
    } catch (error) {
      console.error("Error generating sample notifications:", error);
      alert("Failed to generate sample notifications. Check console for details.");
    } finally {
      setGenerating(false);
    }
  };

  // Filter and search notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) || 
      (filter === 'read' && notification.read);
    
    const matchesSearch = notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.body?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" size={20} />;
      case 'success':
        return <FaCheckCircle className="text-green-500" size={20} />;
      case 'info':
        return <FaInfoCircle className="text-blue-500" size={20} />;
      default:
        return <FaBell className="text-gray-500" size={20} />;
    }
  };

  // Get notification priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#012A2D] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading notifications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#012A2D] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#435355] to-[#012A2D] rounded-xl flex items-center justify-center">
                <FaBell size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-gray-300">Stay updated with your business alerts</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-[#435355] hover:bg-[#5a6b6d] px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FaFilter size={16} />
                <span>Filters</span>
              </button>
              
              {notifications.filter(n => !n.read).length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FaCheck size={16} />
                  <span>Mark All Read</span>
                </button>
              )}

              {/* Generate Sample Notifications Button */}
              {notifications.length === 0 && (
                <button
                  onClick={handleGenerateSamples}
                  disabled={generating}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <FaDatabase size={16} />
                  <span>{generating ? "Generating..." : "Generate Samples"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-[#435355] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
                <FaBell className="text-3xl text-blue-400" />
              </div>
            </div>
            
            <div className="bg-[#435355] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Unread</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {notifications.filter(n => !n.read).length}
                  </p>
                </div>
                <FaEyeSlash className="text-3xl text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-[#435355] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Read</p>
                  <p className="text-2xl font-bold text-green-400">
                    {notifications.filter(n => n.read).length}
                  </p>
                </div>
                <FaEye className="text-3xl text-green-400" />
              </div>
            </div>
            
            <div className="bg-[#435355] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Today</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {notifications.filter(n => {
                      const date = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
                      const today = new Date();
                      return date.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
                <FaClock className="text-3xl text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        {showFilters && (
          <div className="bg-[#435355] rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#012A2D] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter Dropdown */}
              <div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-[#012A2D] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-[#435355] rounded-lg overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <FaBell className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No notifications found</h3>
              <p className="text-gray-300">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'You\'re all caught up! Check back later for new updates.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#012A2D]">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-[#012A2D] transition-all duration-200 ${
                    notification.read ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${
                          notification.read ? 'text-gray-300' : 'text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        
                        {/* Priority Badge */}
                        {notification.priority && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            notification.priority === 'high' ? 'bg-red-500 text-white' :
                            notification.priority === 'medium' ? 'bg-yellow-500 text-black' :
                            'bg-blue-500 text-white'
                          }`}>
                            {notification.priority}
                          </span>
                        )}
                      </div>

                      <p className={`text-gray-300 mb-3 ${
                        notification.read ? 'text-gray-400' : ''
                      }`}>
                        {notification.body}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center space-x-1">
                            <FaClock size={12} />
                            <span>{formatTimestamp(notification.createdAt)}</span>
                          </span>
                          
                          {notification.read && notification.readAt && (
                            <span className="flex items-center space-x-1">
                              <FaEye size={12} />
                              <span>Read {formatTimestamp(notification.readAt)}</span>
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          {!notification.read ? (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <FaCheck size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => markAsUnread(notification.id)}
                              className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                              title="Mark as unread"
                            >
                              <FaEyeSlash size={14} />
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            title="Delete notification"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty State for No Notifications */}
        {notifications.length === 0 && (
          <div className="bg-[#435355] rounded-lg p-12 text-center">
            <FaBell className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
            <p className="text-gray-300 mb-4">
              You'll see important updates, alerts, and reminders here
            </p>
            <div className="text-sm text-gray-400 mb-6">
              <p>• Low stock alerts</p>
              <p>• Order updates</p>
              <p>• System notifications</p>
              <p>• Business insights</p>
            </div>
            <button
              onClick={handleGenerateSamples}
              disabled={generating}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 mx-auto"
            >
              <FaDatabase size={16} />
              <span>{generating ? "Generating..." : "Generate Sample Notifications"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
