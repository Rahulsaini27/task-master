import React, { useContext, useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Bell, CheckCircle, Clock, AlertTriangle, Loader2, Users, Calendar, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import axios from "axios";
import { AppContext } from '../Context/AppContext';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const TASK_STATUS_COLORS = {
  'pending': '#F59E0B',
  'in progress': '#6366F1',
  'completed': '#10B981',
  'overdue': '#EF4444',
  'cancelled': '#6B7280'
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');
  const { API_BASE_URL } = useContext(AppContext);

  const userId = localStorage.getItem("userId") || "demo-user";
  const role = localStorage.getItem("role") || "admin";
  const token = localStorage.getItem('token');  // Retrieve token from localStorage

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/analytics/dashboard?userId=${userId}&role=${role}`, {
            headers: {
              'Authorization': `Bearer ${token}`,  // Attach the token in the Authorization header
            }
          }
        );
  
        // Simulate a delay
        setTimeout(() => {
          setData(res.data);
          setLoading(false);
        }, 800);
  
      } catch (err) {
        console.error("Error fetching dashboard analytics:", err);
        setLoading(false);
      }
    };
  
    fetchAnalytics();
  }, [userId, role, timeRange]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getCompletionRateChange = () => {
    // In a real app, you'd compare to previous period
    const change = Math.floor(Math.random() * 20) - 10;
    return {
      value: change,
      positive: change >= 0
    };
  };

  const completionRateChange = getCompletionRateChange();
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex items-center gap-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-3 py-1 rounded-md text-sm font-medium ${timeRange === 'week' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm font-medium ${timeRange === 'month' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
              <button
                className={`px-3 py-1 rounded-md text-sm font-medium ${timeRange === 'year' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setTimeRange('year')}
              >
                Year
              </button>
            </div>
       
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('tasks')}
              >
                Task Analysis
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'team'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('team')}
              >
                Team Performance
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card
                label="Completion Rate"
                value={`${data.completionRate}%`}
                icon={<Activity className="h-6 w-6 text-indigo-600" />}
                change={completionRateChange.value}
                positive={completionRateChange.positive}
                description="Tasks completed on time"
              />
              <Card
                label="Assigned Tasks"
                value={data.assignedTasksCount}
                icon={<CheckCircle className="h-6 w-6 text-green-600" />}
                description="Currently assigned to you"
              />
              <Card
                label="Created Tasks"
                value={data.createdTasksCount}
                icon={<Calendar className="h-6 w-6 text-amber-600" />}
                description="Tasks you've created"
              />
              <Card
                label="Notifications"
                value={data.unseenNotificationCount}
                icon={<Bell className="h-6 w-6 text-red-600" />}
                description="Unread notifications"
                highlight={data?.unseenNotificationCount > 5}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Task Status Pie */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Task Status</h2>
                    <p className="text-sm text-gray-500">Current distribution of tasks</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.taskStatusBreakdown}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={60}
                        paddingAngle={2}
                        label
                      >
                        {data.taskStatusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} Tasks`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tasks Trends */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Task Activity</h2>
                    <p className="text-sm text-gray-500">Created vs Completed tasks</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.taskCompletionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        name="Completed"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="created"
                        name="Created"
                        stroke="#6366F1"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-500">Latest updates from your team</p>
                </div>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {data?.recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'tasks' && (
          <>
            {/* Task Priority Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Priority Distribution</h2>
                    <p className="text-sm text-gray-500">Tasks by priority level</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.priorityBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Tasks">
                        {data.priorityBreakdown.map((entry, index) => {
                          const colors = ['#EF4444', '#F59E0B', '#10B981'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Overdue Tasks */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Overdue Tasks</h2>
                    <p className="text-sm text-gray-500">Daily trend of overdue tasks</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.overdueTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Overdue Tasks"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Task Completion Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Task Completion Timeline</h2>
                  <p className="text-sm text-gray-500">How your tasks are being completed over time</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.taskCompletionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Completed"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'team' && (role === 'admin' || role === 'manager') && (
          <>
            {/* Team Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Team Performance</h2>
                  <p className="text-sm text-gray-500">Tasks completed by team members</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Member
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed Tasks
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completion Rate
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.completedTasksPerUser.map((user, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                {user.username.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {role === 'admin' ? 'Member' : 'Team Member'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.completedCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${Math.min(100, user.completedCount * 5)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.min(100, user.completedCount * 5)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.completedCount > 15
                              ? 'bg-green-100 text-green-800'
                              : user.completedCount > 10
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {user.completedCount > 15
                              ? 'Excellent'
                              : user.completedCount > 10
                                ? 'Good'
                                : 'Average'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const Card = ({ label, value, icon, change, positive, description, highlight }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${highlight ? 'border-l-4 border-red-500' : ''}`}>
    <div className="flex justify-between">
      <div className="flex items-center justify-center rounded-md bg-indigo-50 h-12 w-12">
        {icon}
      </div>
      {change !== undefined && (
        <div className={`flex items-center ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {positive ?
            <ArrowUp className="h-4 w-4 mr-1" /> :
            <ArrowDown className="h-4 w-4 mr-1" />
          }
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      )}
    </div>
    <div className="mt-6">
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="mt-1 text-base font-medium text-gray-500">{label}</div>
      {description && (
        <div className="mt-1 text-sm text-gray-500">{description}</div>
      )}
    </div>
  </div>
);

const ActivityItem = ({ activity }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'task_created':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'task_completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'comment_added':
        return <Activity className="h-5 w-5 text-purple-500" />;
      case 'task_overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMessage = (activity) => {
    switch (activity.type) {
      case 'task_created':
        return <><span className="font-medium">{activity.user}</span> created <span className="font-medium">{activity.task}</span></>;
      case 'task_completed':
        return <><span className="font-medium">{activity.user}</span> completed <span className="font-medium">{activity.task}</span></>;
      case 'comment_added':
        return <><span className="font-medium">{activity.user}</span> commented on <span className="font-medium">{activity.task}</span></>;
      case 'task_overdue':
        return <><span className="font-medium">{activity.task}</span> is now overdue</>;
      default:
        return <span>Unknown activity</span>;
    }
  };

  return (
    <div className="flex space-x-3">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
          {getIcon(activity.type)}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-800">
          {getMessage(activity)}
        </p>
        <p className="text-sm text-gray-500">
          {activity.time}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;