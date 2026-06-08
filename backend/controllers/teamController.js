const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res, next) => {
  try {
    let query = {};
    
    // Team Leaders only see teams they manage
    if (req.user.role === 'Team Leader') {
      query.teamLeader = req.user._id;
    } else if (req.user.role === 'Employee') {
      // Employees see teams they are member of
      query.members = req.user._id;
    }

    const teams = await Team.find(query)
      .populate('teamLeader', 'name email')
      .populate('members', 'name email role phone')
      .populate('assignedProjects', 'name status deadline');

    res.json(teams);
  } catch (error) {
    next(error);
  }
};

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('teamLeader', 'name email phone')
      .populate('members', 'name email role phone')
      .populate('assignedProjects', 'name status budget revenue deadline');

    if (!team) {
      res.status(404);
      throw new Error('Team not found');
    }

    // Role-based auth
    if (req.user.role === 'Team Leader' && team.teamLeader._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this team');
    }

    if (req.user.role === 'Employee' && !team.members.some(m => m._id.toString() === req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized to view this team');
    }

    res.json(team);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res, next) => {
  try {
    const { name, teamLeader, members, assignedProjects } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Please add a team name');
    }

    // Determine the TL
    let tlId = req.user._id;
    if (req.user.role === 'Admin') {
      if (!teamLeader) {
        res.status(400);
        throw new Error('Please assign a team leader for this team');
      }
      tlId = teamLeader;
    }

    // Verify team leader exists and is a Team Leader
    const leaderUser = await User.findById(tlId);
    if (!leaderUser || leaderUser.role !== 'Team Leader') {
      res.status(400);
      throw new Error('Assigned user must be a Team Leader role');
    }

    // Check duplicate name
    const teamExists = await Team.findOne({ name });
    if (teamExists) {
      res.status(400);
      throw new Error('A team with this name already exists');
    }

    const team = await Team.create({
      name,
      teamLeader: tlId,
      members: members || [],
      assignedProjects: assignedProjects || [],
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('teamLeader', 'name email')
      .populate('members', 'name email')
      .populate('assignedProjects', 'name status');

    res.status(201).json(populatedTeam);
  } catch (error) {
    next(error);
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404);
      throw new Error('Team not found');
    }

    // Auth check: Admin or the team's Team Leader
    if (req.user.role === 'Employee') {
      res.status(403);
      throw new Error('Employees are not authorized to update teams');
    }

    if (req.user.role === 'Team Leader' && team.teamLeader.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only update teams you lead');
    }

    const { name, teamLeader, members, assignedProjects } = req.body;

    if (req.user.role === 'Admin') {
      team.name = name || team.name;
      team.teamLeader = teamLeader || team.teamLeader;
    } else {
      // Team Leaders can change name but not leader
      team.name = name || team.name;
    }

    if (members !== undefined) {
      team.members = members;
    }

    if (assignedProjects !== undefined) {
      team.assignedProjects = assignedProjects;
    }

    const updatedTeam = await team.save();

    const populatedTeam = await Team.findById(updatedTeam._id)
      .populate('teamLeader', 'name email')
      .populate('members', 'name email role phone')
      .populate('assignedProjects', 'name status deadline');

    res.json(populatedTeam);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404);
      throw new Error('Team not found');
    }

    // Auth check
    if (req.user.role === 'Employee') {
      res.status(403);
      throw new Error('Employees are not authorized to delete teams');
    }

    if (req.user.role === 'Team Leader' && team.teamLeader.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only delete teams you lead');
    }

    await Team.deleteOne({ _id: req.params.id });
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};
