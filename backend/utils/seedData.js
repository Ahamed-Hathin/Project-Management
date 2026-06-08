const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// Load environment variables
dotenv.config();

const seed = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // Clear existing collections
    console.log('Clearing database collections...');
    await User.deleteMany({});
    await Client.deleteMany({});
    await Project.deleteMany({});
    await Team.deleteMany({});
    await Task.deleteMany({});
    await Notification.deleteMany({});
    console.log('Collections cleared.');

    // 1. Seed Users
    console.log('Creating users...');
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

    const leader2 = await User.create({
      name: 'Priya (Team Leader)',
      email: 'tl2@company.com',
      password: 'leader123',
      role: 'Team Leader',
      phone: '+91 98765 43212',
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

    const employee2 = await User.create({
      name: 'Surya (Employee)',
      email: 'emp2@company.com',
      password: 'employee123',
      role: 'Employee',
      phone: '+91 98765 43214',
      status: 'Active',
    });

    const employee3 = await User.create({
      name: 'Vijay (Employee)',
      email: 'emp3@company.com',
      password: 'employee123',
      role: 'Employee',
      phone: '+91 98765 43215',
      status: 'Active',
    });

    const employee4 = await User.create({
      name: 'Ajith (Employee)',
      email: 'emp4@company.com',
      password: 'employee123',
      role: 'Employee',
      phone: '+91 98765 43216',
      status: 'Active',
    });

    console.log('Users created.');

    // 2. Seed Clients
    console.log('Creating Tamil Nadu clients...');
    const client1 = await Client.create({
      name: 'Arun Kumar',
      companyName: 'TVS Motors',
      email: 'arun@tvsmotors.com',
      phone: '+91 44 2833 2115',
      address: 'Chaitanya, No. 12 Khader Nawaz Khan Road, Nungambakkam, Chennai',
    });

    const client2 = await Client.create({
      name: 'Karthik Raj',
      companyName: 'The Chennai Silks',
      email: 'contact@chennaisilks.com',
      phone: '+91 422 248 1111',
      address: '74, Usman Road, T. Nagar, Chennai',
    });

    const client3 = await Client.create({
      name: 'Saravana Pandian',
      companyName: 'Saravana Stores',
      email: 'info@saravanastores.in',
      phone: '+91 44 2434 2222',
      address: '14, Purasawalkam High Road, Chennai',
    });

    console.log('Clients created.');

    // 3. Seed Projects
    console.log('Creating demo projects...');
    const twoMonthsAgo = new Date(); twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const tenDaysAgo = new Date(); tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth() + 1);
    const twoMonthsFuture = new Date(); twoMonthsFuture.setMonth(twoMonthsFuture.getMonth() + 2);

    const project1 = await Project.create({
      name: 'TVS Apache Promotion Campaign',
      client: client1._id,
      description: 'Design and develop graphic content and UI for the new TVS Apache series launch.',
      budget: 150000,
      revenue: 100000,
      startDate: twoMonthsAgo,
      deadline: nextMonth,
      status: 'In Progress',
      assignedTeamLeader: leader1._id,
    });

    const project2 = await Project.create({
      name: 'Chennai Silks E-Commerce Site',
      client: client2._id,
      description: 'Develop a modern e-commerce website with enhanced UI/UX and seamless checkout.',
      budget: 250000,
      revenue: 200000,
      startDate: oneMonthAgo,
      deadline: twoMonthsFuture,
      status: 'In Progress',
      assignedTeamLeader: leader1._id,
    });

    const project3 = await Project.create({
      name: 'Saravana Stores Brand Video',
      client: client3._id,
      description: 'Video editing and post-production for upcoming festive season advertisements.',
      budget: 75000,
      revenue: 75000,
      startDate: twoMonthsAgo,
      deadline: oneMonthAgo,
      status: 'Completed',
      assignedTeamLeader: leader2._id,
    });

    console.log('Projects created.');

    // 4. Seed Teams
    console.log('Creating specific teams...');
    const team1 = await Team.create({
      name: 'Developer',
      teamLeader: leader1._id,
      members: [employee1._id],
      assignedProjects: [project1._id, project2._id],
    });

    const team2 = await Team.create({
      name: 'Graphic Designer',
      teamLeader: leader1._id,
      members: [employee2._id],
      assignedProjects: [project1._id],
    });

    const team3 = await Team.create({
      name: 'Editors',
      teamLeader: leader2._id,
      members: [employee3._id],
      assignedProjects: [project3._id],
    });

    const team4 = await Team.create({
      name: 'UI UX Designer',
      teamLeader: leader2._id,
      members: [employee4._id],
      assignedProjects: [project2._id],
    });

    console.log('Teams created.');

    // 5. Seed Tasks
    console.log('Creating demo tasks...');
    const task1 = await Task.create({
      title: 'Develop Backend APIs',
      description: 'Create scalable Node.js APIs for product inventory.',
      project: project2._id,
      assignedEmployee: employee1._id,
      assignedBy: leader1._id,
      priority: 'High',
      deadline: nextMonth,
      status: 'In Progress',
    });

    const task2 = await Task.create({
      title: 'Design Banner Graphics',
      description: 'Create 10 promotional banners for social media.',
      project: project1._id,
      assignedEmployee: employee2._id,
      assignedBy: leader1._id,
      priority: 'Medium',
      deadline: tenDaysAgo,
      status: 'Completed',
    });

    const task3 = await Task.create({
      title: 'Edit Festive Advertisement',
      description: 'Compile and color correct the 30-second spot.',
      project: project3._id,
      assignedEmployee: employee3._id,
      assignedBy: leader2._id,
      priority: 'Urgent',
      deadline: oneMonthAgo,
      status: 'Completed',
    });

    const task4 = await Task.create({
      title: 'Design E-Commerce Wireframes',
      description: 'Create Figma prototypes for the new shopping cart flow.',
      project: project2._id,
      assignedEmployee: employee4._id,
      assignedBy: leader2._id,
      priority: 'High',
      deadline: nextMonth,
      status: 'In Progress',
    });

    console.log('Tasks created.');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
