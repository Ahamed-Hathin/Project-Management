const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Check for user email (convert to lowercase and trim spaces to handle mobile auto-capitalization and trailing spaces)
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error(`DEBUG: User not found for email [${email.trim().toLowerCase()}] in DB. Is the DB empty?`);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error(`DEBUG: Password mismatch for user [${user.email}]. Check seed data hashing!`);
    }

    if (user.status === 'Inactive') {
      res.status(401);
      throw new Error('Your account is deactivated. Please contact administration.');
    }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });

  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

// @desc    Seed Database
// @route   GET /api/auth/seed
// @access  Public
const Client = require('../models/Client');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const seedDatabase = async (req, res, next) => {
  try {
    // Clear existing collections
    await User.deleteMany({});
    await Client.deleteMany({});
    await Project.deleteMany({});
    await Team.deleteMany({});
    await Task.deleteMany({});
    await Notification.deleteMany({});

    // 1. Seed Users
    const admin = await User.create({
      name: 'Ahamed (Admin)',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'Admin',
      phone: '+91 98765 43210',
      status: 'Active',
    });

    const leader1 = await User.create({
      name: 'jakith (Team Leader)',
      email: 'tl1@company.com',
      password: 'leader123',
      role: 'Team Leader',
      phone: '+91 98765 43211',
      status: 'Active',
    });

    const employee1 = await User.create({
      name: 'Ram (Employee)',
      email: 'emp1@company.com',
      password: 'employee123',
      role: 'Employee',
      phone: '+91 98765 43213',
      status: 'Active',
    });

    // 2. Seed Clients
    const client1 = await Client.create({
      name: 'Arun Kumar',
      companyName: 'TVS Motors',
      email: 'arun@tvsmotors.com',
      phone: '+91 44 2833 2115',
      address: 'Chennai',
    });

    // 3. Seed Projects
    const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth() + 1);
    const project1 = await Project.create({
      name: 'TVS Apache Promotion Campaign',
      client: client1._id,
      description: 'Design and develop graphic content.',
      budget: 150000,
      revenue: 100000,
      startDate: new Date(),
      deadline: nextMonth,
      status: 'In Progress',
      assignedTeamLeader: leader1._id,
    });

    // 4. Seed Teams
    const team1 = await Team.create({
      name: 'Developer',
      teamLeader: leader1._id,
      members: [employee1._id],
      assignedProjects: [project1._id],
    });

    // 5. Seed Tasks
    const task1 = await Task.create({
      title: 'Develop Backend APIs',
      description: 'Create scalable Node.js APIs.',
      project: project1._id,
      assignedEmployee: employee1._id,
      assignedBy: leader1._id,
      priority: 'High',
      deadline: nextMonth,
      status: 'In Progress',
    });

    res.json({ message: 'Live Database seeded successfully via API!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  getMe,
  seedDatabase,
};
