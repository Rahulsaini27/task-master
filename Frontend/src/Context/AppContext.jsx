import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1️⃣ Create the context
export const AppContext = createContext();

// 2️⃣ Create the provider component
export const AppProvider = ({ children }) => {


    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    const [user, setUsers] = useState(null);  // User info
    const [notification, setNotification] = useState('');  // Notifications
    const [tasks, setTasks] = useState([]);  // All tasks
    const token = localStorage.getItem('token');  // Retrieve token from localStorage


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/auth/get-all`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,  // Attach token in Authorization header
                    },
                  });
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);
    return (
        <AppContext.Provider value={{
            API_BASE_URL,
            user,
            setUsers,
            notification,
            setNotification,
            tasks,
            setTasks
        }}>
            {children}
        </AppContext.Provider>
    );
};
