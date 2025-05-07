const Notification = require('../models/Notification');
const Task = require('../models/Task');
const User = require('../models/User');

const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.query.userId;
    const role = req.query.role;

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    // 1. Unseen Notifications
    const unseenNotificationCount = await Notification.countDocuments({
      user: userId,
      seen: false
    });

    // 2. Assigned Tasks
    const assignedTasksCount = await Task.countDocuments({ assignedTo: userId });

    // 3. Created Tasks
    const createdTasksCount = await Task.countDocuments({ createdBy: userId });

    // 4. Task Status Breakdown
    const taskStatusBreakdown = await Task.aggregate([
      {
        $match: {
          $or: [{ assignedTo: userId }, { createdBy: userId }]
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // 5. Task Completion Trend (last 15 days)
    const taskCompletionTrend = await Task.aggregate([
      {
        $match: {
          $or: [{ createdBy: userId }, { assignedTo: userId }]
        }
      },
      {
        $project: {
          createdAt: 1,
          status: 1,
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        }
      },
      {
        $group: {
          _id: "$date",
          created: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 15 }
    ]);

    // 6. Priority Breakdown
    const priorityBreakdown = await Task.aggregate([
      {
        $match: {
          $or: [{ assignedTo: userId }, { createdBy: userId }]
        }
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          priority: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // 7. Overdue Trends
    const overdueTrends = await Task.aggregate([
      {
        $match: {
          dueDate: { $lt: new Date() },
          status: { $ne: "completed" },
          $or: [{ createdBy: userId }, { assignedTo: userId }]
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$dueDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 8. Completion Rate
    const totalTasks = await Task.countDocuments({
      $or: [{ createdBy: userId }, { assignedTo: userId }]
    });
    const completedTasks = await Task.countDocuments({
      status: "completed",
      $or: [{ createdBy: userId }, { assignedTo: userId }]
    });
    const completionRate = totalTasks === 0 ? 0 : ((completedTasks / totalTasks) * 100).toFixed(2);

    // 9. Team Performance (for admin/manager)
    let completedTasksPerUser = [];
    if (role === 'admin' || role === 'manager') {
      completedTasksPerUser = await Task.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: "$assignedTo",
            completedCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $project: {
            username: "$user.username",
            completedCount: 1
          }
        }
      ]);
    }

    // 10. Recent Activity (Last 10 Notifications)
    const recentNotifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('task', 'title')
      .populate('assignedBy', 'username');

    const recentActivity = recentNotifications.map((n) => ({
      type: n.message.includes('completed')
        ? 'task_completed'
        : n.message.includes('assigned')
        ? 'task_created'
        : 'task_updated',
      user: n.assignedBy?.username || 'System',
      task: n.task?.title || 'Task',
      time: n.createdAt.toLocaleString()
    }));

    // Final Response
    res.status(200).json({
      unseenNotificationCount,
      assignedTasksCount,
      createdTasksCount,
      taskStatusBreakdown,
      taskCompletionTrend,
      priorityBreakdown,
      overdueTrends,
      completionRate: parseFloat(completionRate),
      completedTasksPerUser,
      recentActivity
    });
  } catch (error) {
    console.error("Dashboard Analytics Error:", error);
    res.status(500).json({ error: "Server error while generating dashboard analytics." });
  }
};

module.exports = getDashboardAnalytics;
