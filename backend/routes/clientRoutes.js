const express = require('express');
const router = express.Router();
const { getClients, getClientById, createClient, updateClient, deleteClient } = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('Admin'), getClients)
  .post(protect, authorize('Admin'), createClient);

router.route('/:id')
  .get(protect, authorize('Admin'), getClientById)
  .put(protect, authorize('Admin'), updateClient)
  .delete(protect, authorize('Admin'), deleteClient);

module.exports = router;
