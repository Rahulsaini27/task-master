const Notification = require('../models/Notification');

// ✅ Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
    const { userId } = req.params;
    try {
        const notifications = await Notification.find({ user: userId })
            .populate('task assignedBy', 'title username')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Mark a notification as seen
exports.markAsSeen = async (req, res) => {
    const { id } = req.params;
    try {
        const notification = await Notification.findByIdAndUpdate(id, { seen: true }, { new: true });
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        res.json({ message: 'Notification marked as seen', notification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Admin: Get all notifications (for full tracking)
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('user task assignedBy', 'username email title')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
