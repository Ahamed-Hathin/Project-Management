const Client = require('../models/Client');
const Project = require('../models/Project');

// @desc    Get all clients (with search and pagination)
// @route   GET /api/clients
// @access  Private/Admin
const getClients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Client.countDocuments(query);

    // Calculate revenue summary and project count for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const projects = await Project.find({ client: client._id });
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalRevenue = projects.reduce((sum, p) => sum + (p.revenue || 0), 0);
        
        return {
          ...client.toObject(),
          projectCount: projects.length,
          totalBudget,
          totalRevenue,
        };
      })
    );

    res.json({
      clients: clientsWithStats,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client details (including their projects and revenue summary)
// @route   GET /api/clients/:id
// @access  Private/Admin
const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404);
      throw new Error('Client not found');
    }

    const projects = await Project.find({ client: client._id })
      .populate('assignedTeamLeader', 'name email')
      .sort({ createdAt: -1 });

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalRevenue = projects.reduce((sum, p) => sum + (p.revenue || 0), 0);

    res.json({
      client,
      projects,
      revenueSummary: {
        totalBudget,
        totalRevenue,
        projectCount: projects.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a client
// @route   POST /api/clients
// @access  Private/Admin
const createClient = async (req, res, next) => {
  try {
    const { name, companyName, email, phone, address } = req.body;

    if (!name || !companyName || !email) {
      res.status(400);
      throw new Error('Please enter name, company name, and email');
    }

    const client = await Client.create({
      name,
      companyName,
      email,
      phone,
      address,
    });

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private/Admin
const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404);
      throw new Error('Client not found');
    }

    const { name, companyName, email, phone, address } = req.body;

    client.name = name || client.name;
    client.companyName = companyName || client.companyName;
    client.email = email || client.email;
    client.phone = phone !== undefined ? phone : client.phone;
    client.address = address !== undefined ? address : client.address;

    const updatedClient = await client.save();
    res.json(updatedClient);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private/Admin
const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404);
      throw new Error('Client not found');
    }

    // Check if client has projects associated
    const projects = await Project.find({ client: client._id });
    if (projects.length > 0) {
      res.status(400);
      throw new Error('Cannot delete client. They have active projects. Delete projects first.');
    }

    await Client.deleteOne({ _id: req.params.id });
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
