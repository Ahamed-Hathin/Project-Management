const express = require('express');
const router = express.Router();
const { getTeams, getTeamById, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTeams)
  .post(protect, authorize('Admin', 'Team Leader'), createTeam);

router.route('/:id')
  .get(protect, getTeamById)
  .put(protect, authorize('Admin', 'Team Leader'), updateTeam)
  .delete(protect, authorize('Admin', 'Team Leader'), deleteTeam);

module.exports = router;
