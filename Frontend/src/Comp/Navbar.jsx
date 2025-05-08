import React, { useState, useEffect, useRef, useContext } from 'react';
import { Bell, UserCircle, Menu, X, CheckCircle } from 'lucide-react';
import { AppContext } from '../Context/AppContext';

export default function Navbar({ toggleSidebar, isSidebarOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const userId = localStorage.getItem('userId');
  const { API_BASE_URL } = useContext(AppContext);

  // Count unseen notifications
  const unseenCount = notifications.filter(notification => !notification.seen).length;
  const token = localStorage.getItem('token');

  // Fetch user notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/notification/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when component mounts
  useEffect(() => {
    if (userId && token) {
      fetchNotifications();
      
      // Optional: Set up a periodic refresh
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 60000); // Refresh every minute
      
      return () => clearInterval(intervalId); // Clean up on unmount
    }
  }, [userId, token, API_BASE_URL]);

  // Mark notification as seen
  const markAsSeen = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notification/${notificationId}/seen`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as seen');
      }
      
      // Update local state to reflect the change
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, seen: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as seen:', err);
    }
  };

  // Mark all notifications as seen
  const markAllAsSeen = async () => {
    try {
      const unseenNotifications = notifications.filter(notification => !notification.seen);
      
      // Create an array of promises for each PUT request
      const markPromises = unseenNotifications.map(notification => 
        fetch(`${API_BASE_URL}/api/notification/${notification._id}/seen`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );
      
      // Execute all requests in parallel
      await Promise.all(markPromises);
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, seen: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as seen:', err);
    }
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    // Close user menu if open
    if (showUserMenu) setShowUserMenu(false);
    // Always fetch fresh notifications when opening the panel
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  // Toggle user menu
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    // Close notifications if open
    if (showNotifications) setShowNotifications(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format notification timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Add a pulsing animation effect to the notification badge
  const pulsingBadgeClass = "absolute top-0 right-0 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs animate-pulse";

  return (
    <nav className="flex items-center justify-between bg-slate-900 border-amber-50 px-2 md:px-4 py-3 shadow-md">
      {/* Left side with menu toggle for mobile */}
      <div className="flex items-center space-x-2">
        <button 
          className="p-2 rounded-full hover:bg-slate-700 text-white"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xl font-bold text-blue-500">Task</span>
      </div>

      {/* Right side: Notifications & User */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            className="relative p-2 rounded-full hover:bg-slate-700"
            onClick={toggleNotifications}
            aria-label={`Notifications ${unseenCount > 0 ? `(${unseenCount} unread)` : ''}`}
          >
            <Bell className="w-5 h-5 text-white" />
            {/* Notification indicator with pulsing effect */}
            {unseenCount > 0 && (
              <span className={pulsingBadgeClass}>
                {unseenCount > 9 ? '9+' : unseenCount}
              </span>
            )}
          </button>

          {/* Notifications panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 md:w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
              <div className="flex justify-between items-center border-b p-3">
                <h3 className="font-medium">Notifications</h3>
                <div className="flex space-x-2">
                  {unseenCount > 0 && (
                    <button 
                      onClick={markAllAsSeen}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading notifications...</div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">{error}</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  <ul>
                    {notifications.map((notification) => (
                      <li 
                        key={notification._id}
                        className={`p-3 border-b hover:bg-gray-50 ${notification.seen ? 'bg-white' : 'bg-blue-50'}`}
                        onClick={() => !notification.seen && markAsSeen(notification._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-gray-500">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                          </div>
                          {!notification.seen && (
                            <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative" ref={userMenuRef}>
          <button 
            className="flex items-center space-x-1 p-1 rounded-full hover:bg-slate-700"
            onClick={toggleUserMenu}
          >
            <UserCircle className="w-6 h-6 text-white" />
            <span className="hidden sm:inline text-sm text-white">John Doe</span>
          </button>

          {/* User dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-50">
              <div className="py-2">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Sign out
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}