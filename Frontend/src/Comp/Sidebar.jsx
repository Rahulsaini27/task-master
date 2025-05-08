import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Briefcase,
  Users,
  Star,
  BarChart2,
  Layers,
  ChevronRight,
  Settings,
  LogOut,
  HelpCircle,
  Bell,
  NotebookIcon,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const role = localStorage.getItem('role') || 'user';
  

  // Define nav items with roles allowed
  const navItems = [
    {
      icon: <Home size={20} />,
      label: 'Dashboard',
      path: '/layout/dashboard',
      roles: ['admin', 'manager','user'],
      description: 'Overview and statistics'
    },
    {
      icon: <Briefcase size={20} />,
      label: 'Tasks',
      path: '/layout/task',
      roles: ['admin', 'manager', 'user'],
      description: 'Manage your tasks'
    },
    {
      icon: <Users size={20} />,
      label: 'Team',
      path: '/layout/user',
      roles: ['admin'],
      description: 'Manage team members'
    },
    {
      icon: <Briefcase size={20} />,
      label: 'Assign Task',
      path: '/layout/task/add-task',
      roles: ['manager','admin'],
      description: 'Delegate work to team'
    },
    {
      icon: <NotebookIcon size={20} />,
      label: 'Notification',
      path: '/layout/notification',
      roles: ['admin'],
      description: 'All Notification'
    },
  ];

  // User teams with color indicators
  const teams = [
    { name: 'Design', color: 'bg-purple-500', unread: 2 },
    { name: 'Engineering', color: 'bg-blue-500', unread: 0 },
    { name: 'Marketing', color: 'bg-green-500', unread: 3 },
  ];

  const navigate = useNavigate(); // Hook for navigation

  const handleLogout = () => {
    // Clear localStorage values for userId, role, token
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    
    // Redirect to login page
    navigate('/login');
  };

  // For mobile: if clicked outside sidebar, close it
  useEffect(() => {
    if (isMobile) {
      const handleClickOutside = (event) => {
        const sidebarElement = document.getElementById('sidebar');
        if (isOpen && sidebarElement && !sidebarElement.contains(event.target)) {
          // Only close if the click is not on the toggle button (which has its own handler)
          if (!event.target.closest('[aria-label="Toggle sidebar"]')) {
            toggleSidebar();
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMobile, isOpen, toggleSidebar]);

  // Mobile overlay and sidebar
  if (isMobile) {
    return (
      <>
        {/* Overlay when sidebar is open on mobile */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20" 
            onClick={toggleSidebar}
          />
        )}
        
        {/* Mobile sidebar */}
        <div 
          id="sidebar"
          className={`fixed inset-y-0 left-0 z-30 bg-slate-900 text-white transition-transform duration-300 transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } w-64 flex flex-col shadow-lg`}
        >
          {/* Mobile sidebar header with close button */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-1.5 mr-2">
                <Layers size={22} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">TaskFlow</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="text-slate-400 hover:text-white focus:outline-none"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Sidebar content */}
          <SidebarContent 
            isOpen={isOpen} 
            location={location} 
            role={role} 
            navItems={navItems} 
            teams={teams} 
            handleLogout={handleLogout} 
          />
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div id="sidebar" className={`bg-slate-900 text-white transition-all duration-300 h-screen ${
      isOpen ? 'w-64' : 'w-20'
    } flex flex-col shadow-lg`}>
      {/* Logo and brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        {isOpen ? (
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-1.5 mr-2">
              <Layers size={22} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">TaskFlow</span>
          </div>
        ) : (
          <div className="mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-1.5">
            <Layers size={22} className="text-white" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white focus:outline-none"
        >
          <ChevronRight
            size={18}
            className={`transform transition-transform ${
              isOpen ? '' : 'rotate-180'
            }`}
          />
        </button>
      </div>
      
      {/* Sidebar content */}
      <SidebarContent 
        isOpen={isOpen} 
        location={location} 
        role={role} 
        navItems={navItems} 
        teams={teams} 
        handleLogout={handleLogout} 
      />
    </div>
  );
};

// Extracted common content component
const SidebarContent = ({ isOpen, location, role, navItems, teams, handleLogout }) => {
  return (
    <>
      {/* Nav links */}
      <nav className="flex-1 pt-5 pb-4 overflow-y-auto scrollbar-thin">
        <div className={`px-4 ${isOpen ? 'mb-4' : 'mb-6'}`}>
          {isOpen ? (
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Main Menu
            </h3>
          ) : (
            <div className="border-b border-slate-700 mx-2"></div>
          )}
        </div>

        <ul className="space-y-1">
          {navItems
            .filter((item) => item.roles.includes(role))
            .map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={index} className="px-2">
                  <Link
                    to={item.path}
                    className={`flex items-center py-2.5 px-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white' 
                        : 'text-slate-300 hover:bg-slate-800'
                    } w-full`}
                  >
                    <span className={`${isActive ? 'text-white' : 'text-slate-400'} flex-shrink-0`}>
                      {item.icon}
                    </span>
                    {isOpen && (
                      <div className="ml-3 flex-1 overflow-hidden">
                        <span className="font-medium text-sm block truncate">{item.label}</span>
                        {isActive && (
                          <p className="text-xs text-slate-300 mt-0.5 truncate">{item.description}</p>
                        )}
                      </div>
                    )}
                    {!isOpen && isActive && (
                      <div className="w-1 h-6 bg-blue-500 rounded-full absolute -right-0.5"></div>
                    )}
                  </Link>
                </li>
              );
            })}
        </ul>

        {/* Teams section */}
        {isOpen && teams && teams.length > 0 && (
          <div className="px-4 mt-8">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Your Teams
            </h3>
            <ul className="space-y-1">
              {teams.map((team, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-slate-800"
                  >
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full ${team.color} mr-3`}></span>
                      <span className="text-slate-300">{team.name}</span>
                    </div>
                    {team.unread > 0 && (
                      <span className="bg-blue-600 text-xs rounded-full px-1.5 py-0.5">
                        {team.unread}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
      
      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="mt-auto mb-4 mx-4 py-2 px-4 flex items-center justify-center text-sm text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
      >
        {isOpen ? (
          "Logout"
        ) : (
          <LogOut size={18} />
        )}
      </button>
    </>
  );
};

export default Sidebar;