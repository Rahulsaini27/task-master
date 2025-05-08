import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../Context/AppContext';
import Swal from 'sweetalert2';
import { Calendar, Clipboard, Users, AlertTriangle, CheckCircle, Edit, ArrowLeft } from 'lucide-react';

function EditTask() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { user, API_BASE_URL } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    const userRole = localStorage.getItem("role");
    
    // 🚨 Check Role on Mount
    useEffect(() => {
        if (userRole !== 'admin' && userRole !== 'manager') {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'You do not have permission to access this page.',
            }).then(() => navigate('/layout/unauthorized'));
        }
    }, [userRole, navigate]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'pending',
        assignedTo: '',
    });

    useEffect(() => {
        if (originalData) {
            setHasChanges(JSON.stringify(formData) !== JSON.stringify(originalData));
        }
    }, [formData, originalData]);

    useEffect(() => {
        // Show loading indicator
        setIsLoading(true);
    
        const token = localStorage.getItem('token');  // Retrieve token from localStorage
    
        if (!token) {
            console.error("No token found. Please login first.");
            setIsLoading(false);  // End loading state if no token is found
            return;
        }
    
        // Fetch task details by taskId
        axios
            .get(`${API_BASE_URL}/api/task/get/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Attach token in Authorization header
                }
            })
            .then((response) => {
                console.log('Task data:', response.data);
                setFormData(response.data);
                setOriginalData(response.data);
                setIsLoading(false);  // End loading state
            })
            .catch((error) => {
                console.error('Error fetching task:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to Load Task',
                    text: 'Unable to load task details. Please try again later.',
                });
                setIsLoading(false);  // End loading state on error
            });
    }, [taskId, API_BASE_URL]);  // Dependency on taskId, re-fetch when taskId changes
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const resetForm = () => {
        if (hasChanges) {
            Swal.fire({
                title: 'Reset changes?',
                text: 'This will revert all changes you made',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, reset it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    setFormData(originalData);
                    Swal.fire('Reset', 'Form has been reset to original values', 'info');
                }
            });
        } else {
            Swal.fire({
                icon: 'info',
                title: 'No Changes',
                text: 'No changes to reset',
                timer: 1500
            });
        }
    };

    const goBack = () => {
        if (hasChanges) {
            Swal.fire({
                title: 'Unsaved Changes',
                text: 'You have unsaved changes. Are you sure you want to leave?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, leave page'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/layout/task');
                }
            });
        } else {
            navigate('/layout/task');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Title',
                text: 'Task title is required.',
            });
            return;
        }

        setIsSubmitting(true);

        axios
            .put(`${API_BASE_URL}/api/task/update/${taskId}`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            })
            .then((response) => {
                console.log('Task updated:', response.data);
                Swal.fire({
                    icon: 'success',
                    title: 'Task Updated',
                    text: 'The task has been updated successfully!',
                    timer: 2000,
                    timerProgressBar: true,
                }).then(() => {
                    navigate('/layout/task'); // Navigate back to task list
                });
            })
            .catch((error) => {
                console.error('Error updating task:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: error.response?.data?.message || 'Failed to update task. Please try again.',
                });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Helper function to render priority badge
    const getPriorityBadge = (priority) => {
        const colors = {
            low: 'bg-green-100 text-green-800 border border-green-200',
            medium: 'bg-blue-100 text-blue-800 border border-blue-200',
            high: 'bg-red-100 text-red-800 border border-red-200'
        };
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority]}`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>;
    };

    // Helper function to render status badge
    const getStatusBadge = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            'in-progress': 'bg-purple-100 text-purple-800 border border-purple-200',
            'completed': 'bg-green-100 text-green-800 border border-green-200'
        };
        
        const labels = {
            'pending': 'Pending',
            'in-progress': 'In Progress',
            'completed': 'Completed'
        };
        
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
            {labels[status]}
        </span>;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-6 text-gray-600 text-lg">Loading task data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
            <button 
                onClick={goBack}
                className="mb-4 sm:mb-6 inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
            >
                <ArrowLeft size={16} className="mr-1" />
                Back to Tasks
            </button>
            
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-t-lg p-4 sm:p-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                    <Edit className="mr-2 sm:mr-3" size={24} />
                    Edit Task
                </h2>
                <p className="text-indigo-100 mt-2 text-sm sm:text-base flex flex-wrap items-center">
                    <span>Task ID: {taskId}</span>
                    {hasChanges && <span className="ml-3 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 sm:mt-0">Unsaved Changes</span>}
                </p>
            </div>
            
            <div className="bg-white rounded-b-lg shadow-xl p-4 sm:p-6 md:p-8 border border-t-0 border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Title Section */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-l-4 border-indigo-500">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Enter task title"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            <div className="flex items-center">
                                <Clipboard className="mr-2" size={18} />
                                Description
                            </div>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Task description"
                        />
                    </div>

                    {/* Due Date and Assigned To */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center">
                                    <Calendar className="mr-2" size={18} />
                                    Due Date
                                </div>
                            </label>
                            <input
                                type="date"
                                id="dueDate"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center">
                                    <Users className="mr-2" size={18} />
                                    Assigned To
                                </div>
                            </label>
                            <select
                                id="assignedTo"
                                name="assignedTo"
                                value={formData.assignedTo}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            >
                                <option value="">Select a team member</option>
                                {Array.isArray(user) &&
                                    user
                                        .filter((u) => {
                                            const role = localStorage.getItem('role');
                                            if (role === 'admin') {
                                                return u.role === 'manager' || u.role === 'user';
                                            } else if (role === 'manager') {
                                                return u.role === 'user';
                                            } else {
                                                return false;
                                            }
                                        })
                                        .map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.username} ({u.role})
                                            </option>
                                        ))}
                            </select>
                        </div>
                    </div>

                    {/* Priority and Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center">
                                    <AlertTriangle className="mr-2" size={18} />
                                    Priority
                                </div>
                            </label>
                            <div className="relative">
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <div className="mr-3">{getPriorityBadge(formData.priority)}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center">
                                    <CheckCircle className="mr-2" size={18} />
                                    Status
                                </div>
                            </label>
                            <div className="relative">
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <div className="mr-3">{getStatusBadge(formData.status)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Metadata */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mt-4 sm:mt-6 border border-gray-200">
                        <div className="text-xs sm:text-sm text-gray-500">
                            <p className="flex items-center mb-1">
                                <span className="font-medium mr-2">Task ID:</span> 
                                <span className="truncate">{taskId}</span>
                            </p>
                            {originalData && originalData.createdAt && (
                                <p className="flex items-center">
                                    <span className="font-medium mr-2">Created:</span>
                                    <span className="truncate">{new Date(originalData.createdAt).toLocaleString()}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row sm:justify-end pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
                        <button
                            type="button"
                            className={`w-full sm:w-auto mb-2 sm:mb-0 sm:mr-4 px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md ${
                                hasChanges ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                            } focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm transition-all duration-200`}
                            onClick={resetForm}
                            disabled={!hasChanges}
                        >
                            Reset Changes
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !hasChanges}
                            className={`w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md transition-all duration-200 ${
                                isSubmitting || !hasChanges
                                    ? 'bg-indigo-400 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <span className="mr-1">Save Changes</span>
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTask;