import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, Check, Clock, User, MessageSquare, AlertCircle, X, Filter, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/AppContext';

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const userRole = localStorage.getItem("role");
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const { API_BASE_URL } = useContext(AppContext);

    // Check Role on Mount
    useEffect(() => {
        if (userRole !== 'admin') {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'You do not have permission to access this page.',
            }).then(() => navigate('/layout/unauthorized'));
        }
    }, [userRole, navigate]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/notification/admin/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsSeen = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/api/notifications/${id}/seen`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === id ? { ...notif, seen: true } : notif
                )
            );
        } catch (error) {
            console.error('Error marking as seen:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.seen;
        if (filter === 'read') return notification.seen;
        return true; // 'all'
    });

    const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto mt-4 md:mt-8 p-3 md:p-6 bg-white rounded-xl shadow-lg">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-8 gap-4">
                <div className="flex items-center">
                    <Bell className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mr-2 md:mr-3" />
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Notifications</h2>
                </div>

                {/* Mobile Filter Button */}
                <button
                    onClick={toggleFilter}
                    className="sm:hidden flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium"
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>

                {/* Mobile Filter Dropdown */}
                {isFilterOpen && (
                    <div className="sm:hidden w-full bg-gray-100 rounded-lg p-2 mt-2">
                        <button
                            onClick={() => { setFilter('all'); setIsFilterOpen(false); }}
                            className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => { setFilter('unread'); setIsFilterOpen(false); }}
                            className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'unread' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                                }`}
                        >
                            Unread
                        </button>
                        <button
                            onClick={() => { setFilter('read'); setIsFilterOpen(false); }}
                            className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'read' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                                }`}
                        >
                            Read
                        </button>
                    </div>
                )}

                {/* Desktop Filter Buttons */}
                <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'all'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'unread'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Unread
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'read'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Read
                    </button>
                </div>
            </div>

            {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 md:py-12 bg-gray-50 rounded-xl">
                    <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mb-4" />
                    <p className="text-lg md:text-xl text-gray-500 font-medium">No notifications available</p>
                    <p className="text-gray-400 mt-2">Check back later for updates</p>
                </div>
            ) : (
                <div className="grid gap-3 md:gap-4">
                    {filteredNotifications.map((notif) => (
                        <div
                            key={notif._id}
                            className={`p-3 md:p-5 border rounded-xl transition-all ${notif.seen
                                    ? 'bg-white border-gray-200'
                                    : 'bg-blue-50 border-blue-200 shadow-sm'
                                }`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start">
                                <div className="flex-shrink-0 mb-3 sm:mb-0">
                                    <div className={`p-2 md:p-3 rounded-full ${notif.seen ? 'bg-gray-100' : 'bg-blue-100'}`}>
                                        <MessageSquare className={`h-5 w-5 md:h-6 md:w-6 ${notif.seen ? 'text-gray-500' : 'text-blue-500'}`} />
                                    </div>
                                </div>

                                <div className="sm:ml-4 flex-1">
                                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-2 md:gap-0">
                                        <div>
                                            <p className="font-semibold text-gray-900">{notif.message}</p>

                                            {notif.task && (
                                                <div className="mt-1 flex items-center">
                                                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-md">
                                                        Task: {notif.task.title}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-shrink-0">
                                            {!notif.seen ? (
                                                <button
                                                    onClick={() => markAsSeen(notif._id)}
                                                    className="flex items-center px-2 py-1 md:px-3 md:py-1.5 bg-blue-600 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                                    Unread
                                                </button>
                                            ) : (
                                                <span className="flex items-center px-2 py-1 md:px-3 md:py-1.5 bg-green-100 text-green-800 text-xs md:text-sm font-medium rounded-lg">
                                                    <Check className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                                    Read
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <User className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                                <span className="truncate">To: <span className="font-medium">{notif.user?.username}</span> ({notif.user?.email})</span>
                                            </div>

                                            {notif.assignedBy && (
                                                <div className="flex items-center text-gray-600">
                                                    <User className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                                    <span className="truncate">From: <span className="font-medium">{notif.assignedBy.username}</span> ({notif.assignedBy.email})</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-2 flex items-center text-xs text-gray-500">
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span>{new Date(notif.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationPage;