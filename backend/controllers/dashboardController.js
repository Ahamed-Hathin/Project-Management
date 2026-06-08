const Client = require('../models/Client');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get dashboard summary based on user role
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const today = new Date();

    if (req.user.role === 'Admin') {
      const totalClients = await Client.countDocuments();
      const totalProjects = await Project.countDocuments();
      const ongoingProjects = await Project.countDocuments({ status: { $in: ['In Progress', 'Testing'] } });
      const completedProjects = await Project.countDocuments({ status: 'Completed' });
      const overdueProjects = await Project.countDocuments({
        status: { $ne: 'Completed' },
        deadline: { $lt: today },
      });

      // Sum of budgets / revenue
      const projects = await Project.find();
      const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
      const totalRevenue = projects.reduce((sum, p) => sum + (p.revenue || 0), 0);

      const totalEmployees = await User.countDocuments({ role: 'Employee' });
      const totalTeamLeaders = await User.countDocuments({ role: 'Team Leader' });

      // Upcoming deadlines (next 14 days)
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 14);

      const upcomingProjectDeadlines = await Project.find({
        status: { $ne: 'Completed' },
        deadline: { $gte: today, $lte: futureDate },
      })
        .select('name deadline status')
        .sort({ deadline: 1 })
        .limit(5);

      const upcomingTaskDeadlines = await Task.find({
        status: { $ne: 'Completed' },
        deadline: { $gte: today, $lte: futureDate },
      })
        .select('title deadline status')
        .sort({ deadline: 1 })
        .limit(5);

      // Recent activities: Get latest 8 tasks activityHistory
      const recentTasks = await Task.find()
        .populate('project', 'name')
        .populate('activityHistory.performedBy', 'name role')
        .sort({ updatedAt: -1 })
        .limit(10);

      let recentActivities = [];
      recentTasks.forEach((task) => {
        task.activityHistory.forEach((hist) => {
          recentActivities.push({
            taskTitle: task.title,
            projectName: task.project ? task.project.name : 'Unknown Project',
            action: hist.action,
            performedBy: hist.performedBy ? hist.performedBy.name : 'System',
            performedRole: hist.performedBy ? hist.performedBy.role : '',
            performedAt: hist.performedAt,
          });
        });
      });

      // Sort recent activities by performedAt descending
      recentActivities = recentActivities
        .sort((a, b) => b.performedAt - a.performedAt)
        .slice(0, 8);

      return res.json({
        role: 'Admin',
        metrics: {
          totalClients,
          totalProjects,
          ongoingProjects,
          completedProjects,
          overdueProjects,
          totalBudget,
          totalRevenue,
          totalEmployees,
          totalTeamLeaders,
        },
        upcomingDeadlines: {
          projects: upcomingProjectDeadlines,
          tasks: upcomingTaskDeadlines,
        },
        recentActivities,
      });
    }

    if (req.user.role === 'Team Leader') {
      const totalProjects = await Project.countDocuments({ assignedTeamLeader: req.user._id });
      const ongoingProjects = await Project.countDocuments({
        assignedTeamLeader: req.user._id,
        status: { $in: ['In Progress', 'Testing'] },
      });
      const completedProjects = await Project.countDocuments({
        assignedTeamLeader: req.user._id,
        status: 'Completed',
      });
      const overdueProjects = await Project.countDocuments({
        assignedTeamLeader: req.user._id,
        status: { $ne: 'Completed' },
        deadline: { $lt: today },
      });

      // Task metrics for TL's projects
      const myProjects = await Project.find({ assignedTeamLeader: req.user._id });
      const myProjectIds = myProjects.map((p) => p._id);

      const totalTasks = await Task.countDocuments({ project: { $in: myProjectIds } });
      const completedTasks = await Task.countDocuments({ project: { $in: myProjectIds }, status: 'Completed' });
      const pendingTasks = await Task.countDocuments({ project: { $in: myProjectIds }, status: 'Pending' });
      const inProgressTasks = await Task.countDocuments({ project: { $in: myProjectIds }, status: 'In Progress' });
      const reviewTasks = await Task.countDocuments({ project: { $in: myProjectIds }, status: 'Review' });

      // Upcoming deadlines (next 14 days)
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 14);

      const upcomingProjectDeadlines = await Project.find({
        assignedTeamLeader: req.user._id,
        status: { $ne: 'Completed' },
        deadline: { $gte: today, $lte: futureDate },
      })
        .select('name deadline status')
        .sort({ deadline: 1 })
        .limit(5);

      const upcomingTaskDeadlines = await Task.find({
        project: { $in: myProjectIds },
        status: { $ne: 'Completed' },
        deadline: { $gte: today, $lte: futureDate },
      })
        .select('title deadline status')
        .sort({ deadline: 1 })
        .limit(5);

      // Recent activities for tasks in TL's projects
      const recentTasks = await Task.find({ project: { $in: myProjectIds } })
        .populate('project', 'name')
        .populate('activityHistory.performedBy', 'name role')
        .sort({ updatedAt: -1 })
        .limit(10);

      let recentActivities = [];
      recentTasks.forEach((task) => {
        task.activityHistory.forEach((hist) => {
          recentActivities.push({
            taskTitle: task.title,
            projectName: task.project ? task.project.name : 'Unknown Project',
            action: hist.action,
            performedBy: hist.performedBy ? hist.performedBy.name : 'System',
            performedRole: hist.performedBy ? hist.performedBy.role : '',
            performedAt: hist.performedAt,
          });
        });
      });

      recentActivities = recentActivities
        .sort((a, b) => b.performedAt - a.performedAt)
        .slice(0, 8);

      return res.json({
        role: 'Team Leader',
        metrics: {
          totalProjects,
          ongoingProjects,
          completedProjects,
          overdueProjects,
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          reviewTasks,
          taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        upcomingDeadlines: {
          projects: upcomingProjectDeadlines,
          tasks: upcomingTaskDeadlines,
        },
        recentActivities,
      });
    }

    if (req.user.role === 'Employee') {
      const totalTasks = await Task.countDocuments({ assignedEmployee: req.user._id });
      const pendingTasks = await Task.countDocuments({ assignedEmployee: req.user._id, status: 'Pending' });
      const inProgressTasks = await Task.countDocuments({ assignedEmployee: req.user._id, status: 'In Progress' });
      const reviewTasks = await Task.countDocuments({ assignedEmployee: req.user._id, status: 'Review' });
      const completedTasks = await Task.countDocuments({ assignedEmployee: req.user._id, status: 'Completed' });
      const overdueTasks = await Task.countDocuments({
        assignedEmployee: req.user._id,
        status: { $ne: 'Completed' },
        deadline: { $lt: today },
      });

      // Upcoming deadlines (next 14 days)
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 14);

      const upcomingTaskDeadlines = await Task.find({
        assignedEmployee: req.user._id,
        status: { $ne: 'Completed' },
        deadline: { $gte: today, $lte: futureDate },
      })
        .populate('project', 'name')
        .sort({ deadline: 1 })
        .limit(5);

      // Recent activities on user's tasks
      const recentTasks = await Task.find({ assignedEmployee: req.user._id })
        .populate('project', 'name')
        .populate('activityHistory.performedBy', 'name role')
        .sort({ updatedAt: -1 })
        .limit(10);

      let recentActivities = [];
      recentTasks.forEach((task) => {
        task.activityHistory.forEach((hist) => {
          recentActivities.push({
            taskTitle: task.title,
            projectName: task.project ? task.project.name : 'Unknown Project',
            action: hist.action,
            performedBy: hist.performedBy ? hist.performedBy.name : 'System',
            performedRole: hist.performedBy ? hist.performedBy.role : '',
            performedAt: hist.performedAt,
          });
        });
      });

      recentActivities = recentActivities
        .sort((a, b) => b.performedAt - a.performedAt)
        .slice(0, 8);

      return res.json({
        role: 'Employee',
        metrics: {
          totalTasks,
          pendingTasks,
          inProgressTasks,
          reviewTasks,
          completedTasks,
          overdueTasks,
        },
        upcomingDeadlines: {
          tasks: upcomingTaskDeadlines,
        },
        recentActivities,
      });
    }

    res.status(400);
    throw new Error('Invalid user role');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
