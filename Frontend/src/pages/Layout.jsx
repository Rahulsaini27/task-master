import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Comp/Navbar';
import Sidebar from "../Comp/Sidebar"

export default function Layout() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="h-screen flex bg-gray-100">
            {/* Sidebar with toggle functionality */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main content area */}
            <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-0' : 'md:ml-0'
                }`}>
                <Navbar />
                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}