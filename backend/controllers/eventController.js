const Event = require('../models/Event');

exports.createEvent = async (req, res) => {
    try {
        const event = await Event.create({ ...req.body, createdBy: req.user.id });
        const populatedEvent = await Event.findById(event._id).populate('attendees', 'name email');
        res.status(201).json({ success: true, data: populatedEvent || event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        // Populate attendees so the calendar can show who is invited
        const events = await Event.find()
            .populate('attendees', 'name email')
            .populate('createdBy', 'name')
            .sort({ date: 1 });
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

