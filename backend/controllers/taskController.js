// // controllers/taskController.js
// const Task = require('../models/Task');
// const User = require('../models/User');
// const Notification = require('../models/Notification');
// const sendEmail = require('../utils/email');



// exports.createTask = async (req, res) => {
//     try {
//         const { title, description, dueDate, priority, status, createdBy, assignedTo } = req.body;

//         // console.log('Request body:', req.body);

//         const task = await Task.create({
//             title,
//             description,
//             dueDate,
//             priority,
//             status,
//             createdBy,
//             assignedTo,
//         });

//         // ✅ Create notification + send email if assignedTo is present
//         if (assignedTo) {
//             const user = await User.findById(assignedTo);
//             if (user) {
//                 await Notification.create({
//                     user: assignedTo,
//                     message: `You have been assigned a new task: "${title}"`,
//                     task: task._id,
//                     assignedBy: createdBy
//                 });

//                 // ✅ Send Email
//                 await sendEmail(
//                     user.email,
//                     'New Task Assigned',
//                     `Hello ${user.username},\n\nYou have been assigned a new task: "${title}".\n\nDescription: ${description}\nDue Date: ${dueDate}\n\nBest regards,\nYour Team`
//                 );

//                 // console.log(`Notification + Email sent to user ${assignedTo}`);
//             }
//         }

//         res.status(201).json({
//             message: 'Task created successfully',
//             task,
//         });
//     } catch (error) {
//         console.error('Error creating task:', error);
//         res.status(500).json({ error: error.message });
//     }
// };


// // ✅ Get All Tasks (with optional search & filter)
// exports.getTasks = async (req, res) => {
//     try {
    
//         const tasks = await Task.find().populate('createdBy assignedTo', 'username email');
//         res.json(tasks);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // ✅ Get Single Task
// exports.getTaskById = async (req, res) => {
//     try {
//         const task = await Task.findById(req.params.id).populate('createdBy assignedTo', 'createdBy assignedTo');
//         if (!task) return res.status(404).json({ error: 'Task not found' });
//         res.json(task);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // ✅ Update Task
// exports.updateTask = async (req, res) => {
//     try {
//         const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
//         res.json(updatedTask);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // ✅ Delete Task
// exports.deleteTask = async (req, res) => {
//     try {
//         const deletedTask = await Task.findByIdAndDelete(req.params.id);
//         if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
//         res.json({ message: 'Task deleted' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// exports.updateTaskStatus = async (req, res) => {
//     const { taskId } = req.params;
//     const { status } = req.body;
  
//     try {
//       // Validate input
//       if (!status) {
//         return res.status(400).json({ message: 'Status is required' });
//       }
  
//       const updatedTask = await Task.findByIdAndUpdate(
//         taskId,
//         { status },
//         { new: true }
//       );
  
//       if (!updatedTask) {
//         return res.status(404).json({ message: 'Task not found' });
//       }
  
//       res.status(200).json({
//         message: 'Task status updated successfully',
//         task: updatedTask
//       });
//     } catch (error) {
//       console.error('Error updating task status:', error);
//       res.status(500).json({ message: 'Server error while updating task status' });
//     }
//   };

const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/email');

// ✅ Create Task
exports.createTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority, status, createdBy, assignedTo } = req.body;

        const task = await Task.create({
            title,
            description,
            dueDate,
            priority,
            status,
            createdBy,
            assignedTo,
        });

        if (assignedTo) {
            const user = await User.findById(assignedTo);
            if (user) {
                await Notification.create({
                    user: assignedTo,
                    message: `You have been assigned a new task: "${title}"`,
                    task: task._id,
                    assignedBy: createdBy
                });

                await sendEmail(
                    user.email,
                    'New Task Assigned',
                    `Hello ${user.username},\n\nYou have been assigned a new task: "${title}".\n\nDescription: ${description}\nDue Date: ${dueDate}\n\nBest regards,\nYour Team`
                );
            }
        }

        res.status(201).json({
            message: 'Task created successfully',
            task,
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get All Tasks
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('createdBy assignedTo', 'username email');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get Single Task
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('createdBy assignedTo', 'username email');
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update Task (with notification & email)
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFields = req.body;

        const oldTask = await Task.findById(id);
        if (!oldTask) return res.status(404).json({ error: 'Task not found' });

        const updatedTask = await Task.findByIdAndUpdate(id, updatedFields, { new: true });

        const notifyUsers = [];

        // AssignedTo
        if (updatedTask.assignedTo) {
            const assignedUser = await User.findById(updatedTask.assignedTo);
            if (assignedUser) {
                await Notification.create({
                    user: assignedUser._id,
                    message: `The task "${updatedTask.title}" has been updated.`,
                    task: updatedTask._id,
                    assignedBy: updatedTask.createdBy
                });

                await sendEmail(
                    assignedUser.email,
                    'Task Updated',
                    `Hello ${assignedUser.username},\n\nThe task "${updatedTask.title}" has been updated.\n\nCheck your dashboard for details.\n\nBest regards,\nYour Team`
                );

                notifyUsers.push(assignedUser.username);
            }
        }

        // CreatedBy (if different from assignedTo)
        if (
            updatedTask.createdBy &&
            (!updatedTask.assignedTo || updatedTask.createdBy.toString() !== updatedTask.assignedTo.toString())
        ) {
            const creatorUser = await User.findById(updatedTask.createdBy);
            if (creatorUser) {
                await Notification.create({
                    user: creatorUser._id,
                    message: `Your task "${updatedTask.title}" has been updated.`,
                    task: updatedTask._id,
                    assignedBy: updatedTask.createdBy
                });

                await sendEmail(
                    creatorUser.email,
                    'Task Updated',
                    `Hello ${creatorUser.username},\n\nYour task "${updatedTask.title}" has been updated.\n\nCheck your dashboard for details.\n\nBest regards,\nYour Team`
                );

                notifyUsers.push(creatorUser.username);
            }
        }

        res.json({
            message: `Task updated successfully. Notifications sent to: ${notifyUsers.join(', ')}`,
            task: updatedTask
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete Task (with notification & email)
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        await Task.findByIdAndDelete(req.params.id);

        const notifyUsers = [];

        // AssignedTo
        if (task.assignedTo) {
            const assignedUser = await User.findById(task.assignedTo);
            if (assignedUser) {
                await Notification.create({
                    user: assignedUser._id,
                    message: `The task "${task.title}" has been deleted.`,
                    assignedBy: task.createdBy
                });

                await sendEmail(
                    assignedUser.email,
                    'Task Deleted',
                    `Hello ${assignedUser.username},\n\nThe task "${task.title}" has been deleted.\n\nBest regards,\nYour Team`
                );

                notifyUsers.push(assignedUser.username);
            }
        }

        // CreatedBy (if different from assignedTo)
        if (
            task.createdBy &&
            (!task.assignedTo || task.createdBy.toString() !== task.assignedTo.toString())
        ) {
            const creatorUser = await User.findById(task.createdBy);
            if (creatorUser) {
                await Notification.create({
                    user: creatorUser._id,
                    message: `Your task "${task.title}" has been deleted.`,
                    assignedBy: task.createdBy
                });

                await sendEmail(
                    creatorUser.email,
                    'Task Deleted',
                    `Hello ${creatorUser.username},\n\nYour task "${task.title}" has been deleted.\n\nBest regards,\nYour Team`
                );

                notifyUsers.push(creatorUser.username);
            }
        }

        res.json({ message: `Task deleted. Notifications sent to: ${notifyUsers.join(', ')}` });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update Task Status (with notification & email)
exports.updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    try {
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        );

        const notifyUsers = [];

        // AssignedTo
        if (updatedTask.assignedTo) {
            const assignedUser = await User.findById(updatedTask.assignedTo);
            if (assignedUser) {
                await Notification.create({
                    user: assignedUser._id,
                    message: `The status of task "${updatedTask.title}" has been changed to "${status}".`,
                    task: updatedTask._id,
                    assignedBy: updatedTask.createdBy
                });

                await sendEmail(
                    assignedUser.email,
                    'Task Status Updated',
                    `Hello ${assignedUser.username},\n\nThe status of task "${updatedTask.title}" has been updated to "${status}".\n\nBest regards,\nYour Team`
                );

                notifyUsers.push(assignedUser.username);
            }
        }

        // CreatedBy (if different from assignedTo)
        if (
            updatedTask.createdBy &&
            (!updatedTask.assignedTo || updatedTask.createdBy.toString() !== updatedTask.assignedTo.toString())
        ) {
            const creatorUser = await User.findById(updatedTask.createdBy);
            if (creatorUser) {
                await Notification.create({
                    user: creatorUser._id,
                    message: `The status of your task "${updatedTask.title}" has been changed to "${status}".`,
                    task: updatedTask._id,
                    assignedBy: updatedTask.createdBy
                });

                await sendEmail(
                    creatorUser.email,
                    'Task Status Updated',
                    `Hello ${creatorUser.username},\n\nThe status of your task "${updatedTask.title}" has been updated to "${status}".\n\nBest regards,\nYour Team`
                );

                notifyUsers.push(creatorUser.username);
            }
        }

        res.status(200).json({
            message: `Task status updated successfully. Notifications sent to: ${notifyUsers.join(', ')}`,
            task: updatedTask
        });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: 'Server error while updating task status' });
    }
};
