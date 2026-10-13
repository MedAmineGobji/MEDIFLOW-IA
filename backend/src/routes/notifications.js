const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = require('../controllers/notificationController');

const router = express.Router();

// Récupérer les notifications de l'utilisateur connecté
router.get('/', authenticate, getUserNotifications);

// Marquer une notification comme lue
router.patch('/:id/read', authenticate, markNotificationAsRead);

// Marquer toutes les notifications comme lues
router.patch('/read-all', authenticate, markAllNotificationsAsRead);

// Supprimer une notification
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;