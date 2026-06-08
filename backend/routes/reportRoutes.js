const express = require('express');
const router = express.Router();
const {
  getClientReport,
  getProjectReport,
  getEmployeeReport,
  getRevenueReport,
  getDeadlineReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);


router.get('/clients', authorize('Admin'), getClientReport);
router.get('/projects', authorize('Admin'), getProjectReport);
router.get('/employees', authorize('Admin', 'Team Leader'), getEmployeeReport);
router.get('/revenue', authorize('Admin'), getRevenueReport);
router.get('/deadlines', authorize('Admin'), getDeadlineReport);

module.exports = router;
