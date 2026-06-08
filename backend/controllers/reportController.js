const Client = require('../models/Client');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get Client Report
// @route   GET /api/reports/clients
// @access  Private/Admin
const getClientReport = async (req, res, next) => {
  try {
    const clients = await Client.find().sort({ name: 1 });
    
    const clientReport = await Promise.all(
      clients.map(async (client) => {
        const projects = await Project.find({ client: client._id });
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalRevenue = projects.reduce((sum, p) => sum + (p.revenue || 0), 0);
        const completedProjects = projects.filter((p) => p.status === 'Completed').length;
        const activeProjects = projects.filter((p) => p.status !== 'Completed').length;

        return {
          clientId: client._id,
          clientName: client.name,
          companyName: client.companyName,
          email: client.email,
          projectCount: projects.length,
          activeProjects,
          completedProjects,
          totalBudget,
          totalRevenue,
        };
      })
    );

    res.json(clientReport);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Project Report
// @route   GET /api/reports/projects
// @access  Private/Admin
const getProjectReport = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('client', 'name companyName')
      .populate('assignedTeamLeader', 'name')
      .sort({ deadline: 1 });

    const projectReport = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          projectId: project._id,
          projectName: project.name,
          clientName: project.client ? project.client.name : 'N/A',
          companyName: project.client ? project.client.companyName : 'N/A',
          teamLeader: project.assignedTeamLeader ? project.assignedTeamLeader.name : 'Unassigned',
          budget: project.budget,
          revenue: project.revenue,
          startDate: project.startDate,
          deadline: project.deadline,
          status: project.status,
          totalTasks,
          completedTasks,
          progress,
        };
      })
    );

    res.json(projectReport);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee Performance Report
// @route   GET /api/reports/employees
// @access  Private/Admin
const getEmployeeReport = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'Employee' }).sort({ name: 1 });

    const employeeReport = await Promise.all(
      employees.map(async (emp) => {
        const tasks = await Task.find({ assignedEmployee: emp._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
        const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
        const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
        const reviewTasks = tasks.filter((t) => t.status === 'Review').length;
        
        // Find distinct projects employee is working on
        const projectIds = [...new Set(tasks.map((t) => t.project.toString()))];
        const projectsCount = projectIds.length;

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          employeeId: emp._id,
          name: emp.name,
          email: emp.email,
          phone: emp.phone || 'N/A',
          status: emp.status,
          projectsCount,
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          reviewTasks,
          completionRate,
        };
      })
    );

    res.json(employeeReport);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Revenue Report (Monthly breakdown & charts helpers)
// @route   GET /api/reports/revenue
// @access  Private/Admin
const getRevenueReport = async (req, res, next) => {
  try {
    const projects = await Project.find().populate('client', 'name companyName');
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalRevenue = projects.reduce((sum, p) => sum + (p.revenue || 0), 0);
    
    // Revenue from completed projects
    const completedProjects = projects.filter((p) => p.status === 'Completed');
    const completedProjectRevenue = completedProjects.reduce((sum, p) => sum + (p.revenue || 0), 0);

    // Group revenue by client
    const clientRevenueMap = {};
    projects.forEach((p) => {
      if (p.client) {
        const clientName = p.client.name;
        clientRevenueMap[clientName] = (clientRevenueMap[clientName] || 0) + (p.revenue || 0);
      }
    });

    const revenueByClient = Object.keys(clientRevenueMap).map((name) => ({
      name,
      revenue: clientRevenueMap[name],
    }));

    // Group revenue by project
    const revenueByProject = projects
      .filter((p) => p.revenue > 0)
      .map((p) => ({
        name: p.name,
        revenue: p.revenue,
        budget: p.budget,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // top 5 projects

    // Monthly revenue simulation based on project startDates
    const monthlyRevenueMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize current year months
    const currentYear = new Date().getFullYear();
    months.forEach((m) => {
      monthlyRevenueMap[`${m} ${currentYear}`] = 0;
    });

    projects.forEach((p) => {
      if (p.startDate) {
        const date = new Date(p.startDate);
        const monthName = months[date.getMonth()];
        const year = date.getFullYear();
        const key = `${monthName} ${year}`;
        
        monthlyRevenueMap[key] = (monthlyRevenueMap[key] || 0) + (p.revenue || 0);
      }
    });

    // Convert map to sorted array
    const monthlyRevenue = Object.keys(monthlyRevenueMap).map((key) => ({
      month: key,
      revenue: monthlyRevenueMap[key],
    })).sort((a, b) => {
      const partsA = a.month.split(' ');
      const partsB = b.month.split(' ');
      if (partsA[1] !== partsB[1]) return parseInt(partsA[1]) - parseInt(partsB[1]);
      return months.indexOf(partsA[0]) - months.indexOf(partsB[0]);
    });

    res.json({
      totalBudget,
      totalRevenue,
      completedProjectRevenue,
      revenueByClient,
      revenueByProject,
      monthlyRevenue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Deadline/Overdue Report
// @route   GET /api/reports/deadlines
// @access  Private/Admin
const getDeadlineReport = async (req, res, next) => {
  try {
    const today = new Date();

    // Overdue Projects
    const overdueProjects = await Project.find({
      status: { $ne: 'Completed' },
      deadline: { $lt: today },
    })
      .populate('client', 'name companyName')
      .populate('assignedTeamLeader', 'name')
      .sort({ deadline: 1 });

    // Overdue Tasks
    const overdueTasks = await Task.find({
      status: { $ne: 'Completed' },
      deadline: { $lt: today },
    })
      .populate('project', 'name')
      .populate('assignedEmployee', 'name')
      .sort({ deadline: 1 });

    // Upcoming deadlines in next 14 days
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 14);

    const upcomingProjects = await Project.find({
      status: { $ne: 'Completed' },
      deadline: { $gte: today, $lte: futureDate },
    })
      .populate('client', 'name')
      .sort({ deadline: 1 });

    const upcomingTasks = await Task.find({
      status: { $ne: 'Completed' },
      deadline: { $gte: today, $lte: futureDate },
    })
      .populate('project', 'name')
      .populate('assignedEmployee', 'name')
      .sort({ deadline: 1 });

    res.json({
      overdueProjects: overdueProjects.map((p) => ({
        id: p._id,
        name: p.name,
        clientName: p.client ? p.client.name : 'N/A',
        teamLeader: p.assignedTeamLeader ? p.assignedTeamLeader.name : 'Unassigned',
        deadline: p.deadline,
        status: p.status,
        daysOverdue: Math.ceil((today - new Date(p.deadline)) / (1000 * 60 * 60 * 24)),
      })),
      overdueTasks: overdueTasks.map((t) => ({
        id: t._id,
        title: t.title,
        projectName: t.project ? t.project.name : 'N/A',
        assignedEmployee: t.assignedEmployee ? t.assignedEmployee.name : 'Unassigned',
        deadline: t.deadline,
        status: t.status,
        daysOverdue: Math.ceil((today - new Date(t.deadline)) / (1000 * 60 * 60 * 24)),
      })),
      upcomingProjects,
      upcomingTasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClientReport,
  getProjectReport,
  getEmployeeReport,
  getRevenueReport,
  getDeadlineReport,
};
