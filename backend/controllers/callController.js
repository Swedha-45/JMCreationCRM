const CallLog = require('../models/CallLog');

exports.addCallLog = async (req, res) => {
    try {
        const call = await CallLog.create({
            ...req.body,
            loggedBy: req.user.id
        });
        const populatedCall = await CallLog.findById(call._id).populate('loggedBy', 'name');
        res.status(201).json({ success: true, data: populatedCall || call });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getClientCalls = async (req, res) => {
    try {
        const calls = await CallLog.find({ clientId: req.params.clientId })
            .populate('loggedBy', 'name')
            .sort({ createdAt: -1 }); // Newest first
        res.status(200).json({ success: true, data: calls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Delete a call log
// @route   DELETE /api/calls/:id
exports.deleteCallLog = async (req, res) => {
    try {
        await CallLog.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Call log deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};