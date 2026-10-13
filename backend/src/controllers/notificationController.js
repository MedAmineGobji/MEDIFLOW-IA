const { eq, and, desc } = require('drizzle-orm');
const { notifications, users } = require('../../../database/schema');
const db = require('../config/database');

/**
 * Récupérer les notifications d'un utilisateur
 */
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.sub;

    const userNotifications = await db.select({
      id: notifications.id,
      title: notifications.title,
      message: notifications.message,
      type: notifications.type,
      relatedId: notifications.relatedId,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt
    })
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

    res.json({
      success: true,
      data: userNotifications
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * Marquer une notification comme lue
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    const updatedNotification = await db.update(notifications)
      .set({ isRead: 1 })
      .where(and(eq(notifications.id, parseInt(id)), eq(notifications.userId, userId)))
      .returning();

    if (updatedNotification.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification introuvable'
      });
    }

    res.json({
      success: true,
      message: 'Notification marquée comme lue'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * Marquer toutes les notifications comme lues
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.sub;

    await db.update(notifications)
      .set({ isRead: 1 })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));

    res.json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

/**
 * Supprimer une notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    await db.delete(notifications)
      .where(and(eq(notifications.id, parseInt(id)), eq(notifications.userId, userId)));

    res.json({
      success: true,
      message: 'Notification supprimée'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
};