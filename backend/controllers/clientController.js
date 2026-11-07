const Client = require('../models/Client');
const Document = require('../models/Document');
const CallLog = require('../models/CallLog');

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private (Director Only)
exports.createClient = async (req, res) => {
  try {
    // Add the Director's ID to the client record automatically
    req.body.createdBy = req.user.id;

    const client = await Client.create(req.body);

    // Populate personInCharge for any initial services
    const populatedClient = await Client.findById(client._id).populate(
      'services.personInCharge',
      'name email'
    );

    res.status(201).json({
      success: true,
      data: populatedClient || client,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private (Director Only)
exports.getClients = async (req, res) => {
  try {
    // Fetch all clients, and populate the 'personInCharge' field with their name and email
    const clients = await Client.find().populate('services.personInCharge', 'name email');

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a service to an existing client
// @route   PUT /api/clients/:id/service
// @access  Private (Director Only)
exports.addService = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Push the new service into the services array
    client.services.push(req.body);
    await client.save();

    // Populate personInCharge so response contains full intern details
    const populatedClient = await Client.findById(client._id).populate(
      'services.personInCharge',
      'name email'
    );

    res.status(200).json({
      success: true,
      data: populatedClient || client,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a client and all associated data (Documents, Call Logs)
// @route   DELETE /api/clients/:id
// @access  Private (Director Only)
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // CRITICAL: Delete all associated data (Documents, Call Logs) before deleting the client
    await Promise.all([
      Document.deleteMany({ clientId: req.params.id }),
      CallLog.deleteMany({ clientId: req.params.id }),
    ]);

    // Delete the client
    await Client.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Client and all associated data deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
