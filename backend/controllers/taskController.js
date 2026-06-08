const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all tasks (with filters and role-based views)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, employee } = req.query;
    let query = {};

    // Role-based visibility
    if (req.user.role === 'Employee') {
      query.assignedEmployee = req.user._id;
    } else if (req.user.role === 'Team Leader') {
      // Find projects managed by this TL
      const projects = await Project.find({ assignedTeamLeader: req.user._id });
      const projectIds = projects.map((p) => p._id);
      
      // TL can see tasks assigned by them OR tasks belonging to their projects
      query.$or = [
        { assignedBy: req.user._id },
        { project: { $in: projectIds } }
      ];
    }

    // Direct filters override
    if (project) {
      query.project = project;
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (employee && req.user.role !== 'Employee') {
      query.assignedEmployee = employee;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name status deadline')
      .populate('assignedEmployee', 'name email role')
      .populate('assignedBy', 'name email role')
      .sort({ deadline: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status deadline assignedTeamLeader')
      .populate('assignedEmployee', 'name email phone role')
      .populate('assignedBy', 'name email role')
      .populate('workNotes.addedBy', 'name role')
      .populate('activityHistory.performedBy', 'name role');

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Role checks
    if (req.user.role === 'Employee' && task.assignedEmployee && task.assignedEmployee._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this task');
    }

    if (req.user.role === 'Team Leader') {
      // Check if project leader
      const project = await Project.findById(task.project);
      const isProjectLeader = project && project.assignedTeamLeader && project.assignedTeamLeader.toString() === req.user._id.toString();
      const isAssignee = task.assignedBy.toString() === req.user._id.toString();
      
      if (!isProjectLeader && !isAssignee) {
        res.status(403);
        throw new Error('Not authorized to view this task');
      }
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedEmployee, priority, deadline } = req.body;

    if (!title || !project || !deadline) {
      res.status(400);
      throw new Error('Please fill in required fields (title, project, deadline)');
    }

    // Role check: Only Admin and Team Leader can create tasks
    if (req.user.role === 'Employee') {
      res.status(403);
      throw new Error('Employees are not authorized to create tasks');
    }

    // Verify project exists
    const proj = await Project.findById(project);
    if (!proj) {
      res.status(404);
      throw new Error('Project not found');
    }

    // If Team Leader, verify they manage the project
    if (req.user.role === 'Team Leader' && proj.assignedTeamLeader && proj.assignedTeamLeader.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Team leaders can only create tasks for their own projects');
    }

    // Verify assigned employee exists and is Employee or Team Leader
    let employeeName = '';
    if (assignedEmployee) {
      const emp = await User.findById(assignedEmployee);
      if (!emp) {
        res.status(404);
        throw new Error('Assigned employee not found');
      }
      employeeName = emp.name;
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedEmployee: assignedEmployee || null,
      assignedBy: req.user._id,
      priority: priority || 'Medium',
      deadline,
      status: 'Pending',
      activityHistory: [
        {
          action: 'Task created',
          performedBy: req.user._id,
        },
      ],
    });

    // Create notification if assigned
    if (assignedEmployee) {
      await Notification.create({
        recipient: assignedEmployee,
        message: `You have been assigned a new task: "${title}" by ${req.user.name}`,
        type: 'Task Assigned',
      });

      // Update activity history
      task.activityHistory.push({
        action: `Task assigned to ${employeeName}`,
        performedBy: req.user._id,
      });
      await task.save();
    }

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details (Admin/TL full edit, Employee/TL status & work notes edit)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const { title, description, assignedEmployee, priority, deadline, status, note } = req.body;

    const oldStatus = task.status;
    const oldEmployee = task.assignedEmployee ? task.assignedEmployee.toString() : null;

    // Check permissions
    if (req.user.role === 'Employee') {
      // Employee can only update status and add notes
      if (title || description || assignedEmployee || priority || deadline) {
        res.status(403);
        throw new Error('Employees are only allowed to update status and add work notes');
      }

      if (task.assignedEmployee && task.assignedEmployee.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You can only update tasks assigned to you');
      }
    }

    // Update status if provided
    if (status && status !== task.status) {
      task.status = status;
      task.activityHistory.push({
        action: `Status changed from ${oldStatus} to ${status}`,
        performedBy: req.user._id,
      });

      // If status changed to Completed, and project status needs checking, we log it
      if (status === 'Completed') {
        // Find if project is completed, can notify project TL/Admin
        const proj = await Project.findById(task.project);
        if (proj && proj.assignedTeamLeader) {
          await Notification.create({
            recipient: proj.assignedTeamLeader,
            message: `Task "${task.title}" has been completed by ${req.user.name}`,
            type: 'Info',
          });
        }
      }
    }

    // Add work note if provided
    if (note && note.trim() !== '') {
      task.workNotes.push({
        note: note.trim(),
        addedBy: req.user._id,
      });
      task.activityHistory.push({
        action: 'Added a work note',
        performedBy: req.user._id,
      });
    }

    // Admin/TL full updates
    if (req.user.role !== 'Employee') {
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.priority = priority || task.priority;
      task.deadline = deadline || task.deadline;

      if (assignedEmployee !== undefined) {
        const newEmpId = assignedEmployee ? assignedEmployee : null;
        if (newEmpId !== oldEmployee) {
          task.assignedEmployee = newEmpId;
          
          if (newEmpId) {
            const emp = await User.findById(newEmpId);
            const empName = emp ? emp.name : 'Employee';
            
            task.activityHistory.push({
              action: `Task reassigned to ${empName}`,
              performedBy: req.user._id,
            });

            await Notification.create({
              recipient: newEmpId,
              message: `You have been assigned a task: "${task.title}" by ${req.user.name}`,
              type: 'Task Assigned',
            });
          } else {
            task.activityHistory.push({
              action: 'Task unassigned',
              performedBy: req.user._id,
            });
          }
        }
      }
    }

    const updatedTask = await task.save();
    
    // Fetch populated version to send back
    const populatedTask = await Task.findById(updatedTask._id)
      .populate('project', 'name status deadline')
      .populate('assignedEmployee', 'name email role')
      .populate('assignedBy', 'name email role')
      .populate('workNotes.addedBy', 'name role')
      .populate('activityHistory.performedBy', 'name role');

    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Permissions check
    if (req.user.role === 'Employee') {
      res.status(403);
      throw new Error('Employees are not authorized to delete tasks');
    }

    if (req.user.role === 'Team Leader') {
      const proj = await Project.findById(task.project);
      const isProjectLeader = proj && proj.assignedTeamLeader && proj.assignedTeamLeader.toString() === req.user._id.toString();
      const isAssigner = task.assignedBy.toString() === req.user._id.toString();

      if (!isProjectLeader && !isAssigner) {
        res.status(403);
        throw new Error('Team leaders can only delete tasks for their own projects or tasks they assigned');
      }
    }

    await Task.deleteOne({ _id: req.params.id });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
