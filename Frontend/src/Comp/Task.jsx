import React, { useContext, useEffect, useState } from 'react';
import {
  Trash2, Edit, Check, RefreshCw, AlertCircle, Clock,
  ChevronDown, Calendar, Target, CheckCircle2, Loader2,
  Filter, SortDesc, User, Paperclip, Menu, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AppContext } from '../Context/AppContext';

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('dueDate');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(null);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  // Add states for tracking operations in progress
  const [deletingTasks, setDeletingTasks] = useState([]);
  const [updatingTasks, setUpdatingTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { API_BASE_URL } = useContext(AppContext);

  useEffect(() => {
    fetchTasks();
    
    // Close mobile menu on screen resize
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileControlsOpen) {
        setMobileControlsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      // Simulate API call with mock data
      // In real implementation:

      const response = await fetch(`${API_BASE_URL}/api/task/get-all`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
        }
      });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (taskId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Add taskId to deleting array
          setDeletingTasks(prev => [...prev, taskId]);
          
          const token = localStorage.getItem('token');
          await fetch(`${API_BASE_URL}/api/task/delete/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,  // Attach token in Authorization header
            },
          });
        
          setTasks(tasks.filter(task => task._id !== taskId));
          Swal.fire(
            'Deleted!',
            'Your task has been deleted.',
            'success'
          );
        } catch (error) {
          console.error('Error deleting task:', error);
          Swal.fire(
            'Error!',
            'Failed to delete task.',
            'error'
          );
        } finally {
          // Remove taskId from deleting array
          setDeletingTasks(prev => prev.filter(id => id !== taskId));
        }
      }
    });
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      // Add taskId to updating array
      setUpdatingTasks(prev => [...prev, taskId]);
      
      const token = localStorage.getItem('token');
      // In real implementation:
      await fetch(`${API_BASE_URL}/api/task/upt-status/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });

      setTasks(tasks.map(task =>
        task._id === taskId ? { ...task, status: newStatus } : task
      ));

      setIsStatusMenuOpen(null);

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Task status changed to ${newStatus}`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update task status'
      });
    } finally {
      // Remove taskId from updating array
      setUpdatingTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleEditClick = (taskId) => {
    navigate(`/layout/task/edit-task/${taskId}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-400';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <CheckCircle2 size={12} className="mr-1" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <AlertCircle size={12} className="mr-1" /> Overdue
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const sortedTasks = [...tasks]
    .filter(task => filterStatus === 'all' || task.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority.toLowerCase()] - priorityOrder[b.priority.toLowerCase()];
      }
      return 0;
    });

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

  if (error) {
    return (
      <div className="p-4 md:p-8 flex justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 md:px-6 py-4 rounded-lg max-w-md w-full shadow-sm">
          <div className="flex items-center mb-3">
            <AlertCircle size={20} className="mr-2" />
            <h3 className="font-semibold">Error Loading Tasks</h3>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchTasks}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded flex items-center justify-center font-medium transition-colors">
            <RefreshCw size={16} className="mr-2" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const FilterControls = () => (
    <>
      {/* Filter dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          className="flex items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          <Filter size={16} className="mr-2" />
          Filter: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
          <ChevronDown size={14} className="ml-2" />
        </button>

        {isFilterMenuOpen && (
          <div className="absolute z-10 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 w-40">
            <button
              onClick={() => {
                setFilterStatus('all');
                setIsFilterMenuOpen(false);
                setMobileControlsOpen(false);
              }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              All
            </button>
            <button
              onClick={() => {
                setFilterStatus('pending');
                setIsFilterMenuOpen(false);
                setMobileControlsOpen(false);
              }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Pending
            </button>
            <button
              onClick={() => {
                setFilterStatus('completed');
                setIsFilterMenuOpen(false);
                setMobileControlsOpen(false);
              }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Completed
            </button>
            <button
              onClick={() => {
                setFilterStatus('overdue');
                setIsFilterMenuOpen(false);
                setMobileControlsOpen(false);
              }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Overdue
            </button>
          </div>
        )}
      </div>

      {/* Sort options */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setMobileControlsOpen(false);
          }}
          className="bg-gray-100 text-gray-800 text-sm rounded px-3 py-2 border-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3'>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Task Manager</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage and track your team's tasks and deadlines</p>
        </div>
        <Link
          to="/layout/task/add-task"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm sm:text-base"
        >
          Add Task
        </Link>
      </div>

      {/* Controls bar */}
      <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-4 md:mb-6">
        {/* Mobile controls toggle */}
        <div className="md:hidden flex justify-between items-center mb-3">
          <button
            onClick={() => setMobileControlsOpen(!mobileControlsOpen)}
            className="flex items-center bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded text-sm font-medium transition-colors text-blue-700"
          >
            {mobileControlsOpen ? <X size={16} className="mr-2" /> : <Menu size={16} className="mr-2" />}
            {mobileControlsOpen ? 'Close Filters' : 'Show Filters'}
          </button>
          
          <button
            onClick={fetchTasks}
            disabled={refreshing}
            className={`${refreshing
              ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer'
              } px-3 py-2 rounded text-sm font-medium flex items-center transition-colors`}
          >
            {refreshing ? (
              <>
                <Loader2 size={16} className="mr-1" /> Refreshing...
              </>
            ) : (
              <>
                <RefreshCw size={16} className="mr-1" /> Refresh
              </>
            )}
          </button>
        </div>
        
        {/* Mobile controls dropdown */}
        {mobileControlsOpen && (
          <div className="md:hidden flex flex-col gap-3 pb-3 border-b border-gray-200">
            <FilterControls />
          </div>
        )}
        
        {/* Desktop controls */}
        <div className="hidden md:flex flex-wrap justify-between items-center">
          <div className="flex flex-wrap items-center gap-3">
            <FilterControls />
          </div>

          <button
            onClick={fetchTasks}
            disabled={refreshing}
            className={`${refreshing
              ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer'
              } px-4 py-2 rounded text-sm font-medium flex items-center transition-colors`}
          >
            {refreshing ? (
              <>
                <Loader2 size={16} className="mr-2" /> Refreshing...
              </>
            ) : (
              <>
                <RefreshCw size={16} className="mr-2" /> Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Task list */}
      {sortedTasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <Paperclip size={24} className="text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {filterStatus !== 'all'
              ? `No ${filterStatus} tasks available. Try changing the filter.`
              : 'Add your first task to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {sortedTasks.map(task => (
            <div
              key={task._id}
              className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-5 transition-all hover:shadow"
            >
              {/* Task Header: Title & Status */}
              <div className="flex justify-between items-start mb-2 sm:mb-3 flex-wrap gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{task.title}</h3>
                {getStatusBadge(task.status)}
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">{task.description}</p>

              {/* Task Info Section */}
              <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-between sm:items-center gap-2 sm:gap-4">
                {/* Info grid for mobile, flex for desktop */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs sm:text-sm text-gray-600 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                  {/* Priority */}
                  <div className="flex items-center">
                    <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2 ${getPriorityColor(task.priority)}`}></span>
                    <span className="capitalize">{task.priority} Priority</span>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1 sm:mr-2 text-blue-500" />
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>

                  {/* Created By */}
                  <div className="flex items-center">
                    <User size={14} className="mr-1 sm:mr-2 text-purple-500" />
                    <span className="truncate">Given by {task.createdBy.username}</span>
                  </div>

                  {/* Assigned To */}
                  <div className="flex items-center">
                    <User size={14} className="mr-1 sm:mr-2 text-green-500" />
                    <span className="truncate">Given to {task.assignedTo ? task.assignedTo.username : 'Unassigned'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 justify-end mt-3 sm:mt-0 sm:justify-start">
                  {/* Status Update Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsStatusMenuOpen(isStatusMenuOpen === task._id ? null : task._id)}
                      className={`p-2 rounded-full ${updatingTasks.includes(task._id)
                          ? 'bg-blue-50 text-blue-300 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer'
                        } transition flex items-center`}
                      title="Update status"
                      disabled={updatingTasks.includes(task._id)}
                    >
                      {updatingTasks.includes(task._id) ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                    </button>

                    {isStatusMenuOpen === task._id && !updatingTasks.includes(task._id) && (
                      <div className="absolute right-0 z-10 mt-2 bg-white rounded-md shadow-lg border border-gray-200 py-1 w-32">
                        <button
                          onClick={() => handleStatusUpdate(task._id, 'pending')}
                          className="block px-4 py-2 text-sm text-yellow-600 hover:bg-gray-100 w-full text-left"
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(task._id, 'completed')}
                          className="block px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left"
                        >
                          Completed
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(task._id, 'overdue')}
                          className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          Overdue
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleEditClick(task._id)}
                    className="p-2 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 transition"
                    title="Edit task"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(task._id)}
                    disabled={deletingTasks.includes(task._id)}
                    className={`p-2 rounded-full ${deletingTasks.includes(task._id)
                        ? 'bg-red-50 text-red-300 cursor-not-allowed'
                        : 'bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer'
                      } transition flex items-center`}
                    title="Delete task"
                  >
                    {deletingTasks.includes(task._id) ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Task;