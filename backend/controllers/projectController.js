const Project = require('../models/Project');
const Task = require('../models/Task');
const Client = require('../models/Client');

// @desc    Get all projects (with role-based access)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    // Role-based filtering
    if (req.user.role === 'Team Leader') {
      query.assignedTeamLeader = req.user._id;
    } else if (req.user.role === 'Employee') {
      // Find projects where user has assigned tasks
      const tasks = await Task.find({ assignedEmployee: req.user._id });
      const projectIds = tasks.map((t) => t.project);
      query._id = { $in: projectIds };
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .populate('client', 'name companyName email')
      .populate('assignedTeamLeader', 'name email')
      .sort({ createdAt: -1 });

    // Calculate dynamic progress (completed tasks / total tasks) for each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          progress,
        };
      })
    );

    res.json(projectsWithProgress);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details + task stats + dynamic progress
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name companyName email phone address')
      .populate('assignedTeamLeader', 'name email phone');

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Role verification
    if (req.user.role === 'Team Leader' && project.assignedTeamLeader && project.assignedTeamLeader._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this project');
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedEmployee', 'name email')
      .populate('assignedBy', 'name email');

    // If employee, verify they are assigned to at least one task or have access
    if (req.user.role === 'Employee') {
      const isAssigned = tasks.some(
        (task) => task.assignedEmployee && task.assignedEmployee._id.toString() === req.user._id.toString()
      );
      if (!isAssigned) {
        res.status(403);
        throw new Error('Not authorized to view this project');
      }
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
    const reviewTasks = tasks.filter((t) => t.status === 'Review').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      project,
      tasks,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        reviewTasks,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res, next) => {
  try {
    const { name, client, description, budget, revenue, startDate, deadline, assignedTeamLeader } = req.body;

    if (!name || !client || !startDate || !deadline) {
      res.status(400);
      throw new Error('Please fill in required fields (name, client, startDate, deadline)');
    }

    // Check if client exists
    const clientExists = await Client.findById(client);
    if (!clientExists) {
      res.status(404);
      throw new Error('Client not found');
    }

    const project = await Project.create({
      name,
      client,
      description,
      budget,
      revenue,
      startDate,
      deadline,
      assignedTeamLeader: assignedTeamLeader || null,
      status: 'Not Started',
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check role permission
    if (req.user.role === 'Employee') {
      res.status(403);
      throw new Error('Employees are not authorized to update projects');
    }

    if (req.user.role === 'Team Leader' && project.assignedTeamLeader && project.assignedTeamLeader.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Team leaders can only update their assigned projects');
    }

    const { name, client, description, budget, revenue, startDate, deadline, status, assignedTeamLeader } = req.body;

    // Team Leader is restricted in what they can edit (only description, status)
    if (req.user.role === 'Team Leader') {
      project.status = status || project.status;
      project.description = description !== undefined ? description : project.description;
    } else {
      // Admin has full control
      project.name = name || project.name;
      project.client = client || project.client;
      project.description = description !== undefined ? description : project.description;
      project.budget = budget !== undefined ? budget : project.budget;
      project.revenue = revenue !== undefined ? revenue : project.revenue;
      project.startDate = startDate || project.startDate;
      project.deadline = deadline || project.deadline;
      project.status = status || project.status;
      project.assignedTeamLeader = assignedTeamLeader !== undefined ? assignedTeamLeader : project.assignedTeamLeader;
    }

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: project._id });

    await Project.deleteOne({ _id: req.params.id });
    res.json({ message: 'Project and all associated tasks removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
