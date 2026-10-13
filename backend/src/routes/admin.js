const express = require('express');
const { getGlobalStats, getRecentNotifications } = require('../controllers/adminController');
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/userManagementController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Statistiques globales - admin uniquement
router.get('/stats/global', authenticate, authorize(['admin']), getGlobalStats);

// Notifications récentes - admin uniquement
router.get('/notifications/recent', authenticate, authorize(['admin']), getRecentNotifications);

// Gestion des utilisateurs - admin uniquement
router.get('/users', authenticate, authorize(['admin']), getAllUsers);
router.put('/users/:id/role', authenticate, authorize(['admin']), updateUserRole);
router.delete('/users/:id', authenticate, authorize(['admin']), deleteUser);

module.exports = router;
