import React, { useState, useEffect, useContext } from 'react';
import { PlusCircle, Trash2, Edit, X, Users, Search, Shield, Mail, User as UserIcon, Menu, Loader2 } from 'lucide-react';
import axios from "axios";
import Swal from 'sweetalert2';
import { AppContext } from '../Context/AppContext';

function User() {
  // State for user data and UI controls
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem('token');  // Retrieve token from localStorage
  const { API_BASE_URL } = useContext(AppContext);

  // Form state for adding/editing users
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // API call to fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
  
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/get-all`, {
        headers: {
          'Authorization': `Bearer ${token}`,  
        },
      });
  
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to load users',
        text: 'Unable to fetch user data. Please try again.',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add a new user
  const handleAddUser = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`, 
        formData,  // Pass formData as the request body
        {
          headers: {
            'Authorization': `Bearer ${token}`,  // Include token in the headers
          }
        }
      );
  
      if (response.data) {
        // Close modal and reset form
        setShowAddModal(false);
        setFormData({ username: '', email: '', password: '', role: 'user' });
  
        // Refresh the users list to ensure we have the latest data
        await fetchUsers();
  
        // Show success notification
        Swal.fire({
          icon: 'success',
          title: 'User Added!',
          text: `${formData.username} has been successfully added.`,
          confirmButtonColor: '#3b82f6',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add User',
        text: error.response?.data?.message || "Something went wrong. Please try again.",
        confirmButtonColor: '#3b82f6'
      });
    }
  };
  

  // Set up user editing
  const handleEditClick = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't populate password for security reasons
      role: user.role
    });
    setShowEditModal(true);
  };

  // Update user
  const handleUpdateUser = async () => {
    try {
      const userData = { ...formData };

      // Only include password if it was changed
      if (!formData.password) {
        delete userData.password;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/auth/update/${currentUser.id}`,
        userData ,  {
          headers: {
            'Authorization': `Bearer ${token}`,  // Include token in the headers
          }
        }
      );

      if (response.data) {
        // Reset state and close modal
        setShowEditModal(false);
        setCurrentUser(null);
        setFormData({ username: '', email: '', password: '', role: 'user' });
        
        // Refresh the users list to ensure we have the latest data
        await fetchUsers();
        
        // Show success notification
        Swal.fire({
          icon: 'success',
          title: 'User Updated!',
          text: `${userData.username}'s information has been updated.`,
          confirmButtonColor: '#3b82f6',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || "Failed to update user. Please try again.",
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, username) => {
    // Ask for confirmation with SweetAlert
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete user "${username}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/auth/delete/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,  // Include token in the headers
            }
          });
          
          // Refresh the users list
          await fetchUsers();
          
          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `User "${username}" has been deleted.`,
            confirmButtonColor: '#3b82f6',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: error.response?.data?.message || "Failed to delete user. Please try again.",
            confirmButtonColor: '#3b82f6'
          });
        }
      }
    });
  };

  // Reset form when closing modals
  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setCurrentUser(null);
    setFormData({ username: '', email: '', password: '', role: 'user' });
  };

  // Render role badge
  const renderRoleBadge = (role) => {
    switch(role) {
      case 'admin':
        return (
          <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </span>
        );
      case 'manager':
        return (
          <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            <Shield className="w-3 h-3 mr-1" />
            Manager
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <UserIcon className="w-3 h-3 mr-1" />
            User
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <Users className="mr-3 text-blue-600 h-6 w-6 md:h-8 md:w-8" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors shadow-md"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add User
          </button>
        </div>

        {/* Search and filter */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Users list - Responsive Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center">
                      <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
                      <p className="mt-4 text-gray-600">Loading </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center">
                      <div className="text-gray-500 font-medium">No users found</div>
                      <div className="text-gray-400 text-sm mt-1">
                        {searchQuery ? "Try adjusting your search query" : "Add users to get started"}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-700 font-medium text-sm">
                              {user.username.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3 md:ml-4 font-medium text-gray-900">{user.username}</div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-500">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {renderRoleBadge(user.role)}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-full mr-2 transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-screen bg-gray-50">
              <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
                  <p className="mt-4 text-gray-600">Loading </p>
              </div>
          </div>
            ) : filteredUsers.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="text-gray-500 font-medium">No users found</div>
                <div className="text-gray-400 text-sm mt-1">
                  {searchQuery ? "Try adjusting your search query" : "Add users to get started"}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-700 font-medium text-sm">
                            {user.username.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div>
                        {renderRoleBadge(user.role)}
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-full mr-2 transition-colors"
                        title="Edit user"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add User Modal - Responsive */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Add New User</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6 md:mt-8">
                  <button
                    onClick={closeModal}
                    className="px-3 md:px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal - Responsive */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Edit User</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6 md:mt-8">
                  <button
                    onClick={closeModal}
                    className="px-3 md:px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default User;