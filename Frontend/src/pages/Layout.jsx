import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Comp/Navbar';
import Sidebar from "../Comp/Sidebar";

export default function Layout() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile screen size on mount and resize
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
            // Auto-close sidebar on mobile
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        // Initial check
        checkScreenSize();

        // Add resize listener
        window.addEventListener('resize', checkScreenSize);
        
        // Cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="h-screen flex bg-gray-100 overflow-hidden">
            {/* Sidebar with toggle functionality */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
                isMobile={isMobile} 
            />

            {/* Main content area */}
            <div 
                className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
                    isSidebarOpen ? (isMobile ? 'ml-0' : 'ml-0 ') : 'ml-0 md:ml-20'
                }`}
            >
                <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <div className="flex-1 overflow-auto p-3 md:p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}