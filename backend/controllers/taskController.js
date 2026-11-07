const Task = require('../models/Task');

// @desc    Create a new task
exports.createTask = async (req, res) => {
    try {
        // If Director creates it, they might assign it to an Intern
        // If Intern creates it, it's assigned to themselves
        const assignedTo = req.body.assignedTo || req.user.id;

        const task = await Task.create({
            ...req.body,
            assignedTo,
            assignedBy: req.user.id,
        });

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get tasks (Director sees all, Intern sees own)
exports.getTasks = async (req, res) => {
    try {
        let query = {};

        // If NOT a director, only show tasks assigned to them
        if (req.user.role !== 'director') {
            query.assignedTo = req.user.id;
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update task status (Drag and Drop)
exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        // Security: Interns can only update THEIR OWN tasks
        if (req.user.role !== 'director' && task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this task' });
        }

        task.status = status;
        await task.save();

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};