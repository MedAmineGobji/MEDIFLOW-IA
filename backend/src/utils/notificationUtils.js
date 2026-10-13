const { eq, or, sql } = require('drizzle-orm');
const { notifications, users } = require('../../../database/schema');
const db = require('../config/database');

/**
 * Notifier tous les administrateurs d'un événement
 */
const notifyAdmins = async ({ title, message, type, relatedId }) => {
    try {
        // Récupérer tous les utilisateurs qui ont le rôle admin (rôle unique ou dans roles[])
        const admins = await db.select({ id: users.id, roles: users.roles, role: users.role })
            .from(users)
            .where(or(
                eq(users.role, 'admin'),
                sql`'admin' = ANY(${users.roles})`
            ));

        if (admins.length === 0) return;

        // Créer une notification pour chaque admin
        const notificationPromises = admins.map(admin => {
            return db.insert(notifications).values({
                userId: admin.id,
                title,
                message,
                type,
                relatedId,
                isRead: 0
            });
        });

        await Promise.all(notificationPromises);
        console.log(`🔔 Notifications envoyées à ${admins.length} administrateurs: ${title}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi des notifications aux admins:', error);
    }
};

/**
 * Notifier tous les RH recruteurs d'un événement
 */
const notifyHRRecruiters = async ({ title, message, type, relatedId }) => {
    try {
        // Récupérer tous les utilisateurs qui ont le rôle hrRecruiter (rôle unique ou dans roles[])
        const hrRecruiters = await db.select({ id: users.id, roles: users.roles, role: users.role })
            .from(users)
            .where(or(
                eq(users.role, 'hrRecruiter'),
                sql`'hrRecruiter' = ANY(${users.roles})`
            ));

        if (hrRecruiters.length === 0) return;

        // Créer une notification pour chaque RH
        const notificationPromises = hrRecruiters.map(hr => {
            return db.insert(notifications).values({
                userId: hr.id,
                title,
                message,
                type,
                relatedId,
                isRead: 0
            });
        });

        await Promise.all(notificationPromises);
        console.log(`🔔 Notifications envoyées à ${hrRecruiters.length} RH recruteurs: ${title}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi des notifications aux RH:', error);
    }
};

/**
 * Notifier un utilisateur spécifique
 */
const notifyUser = async (userId, { title, message, type, relatedId }) => {
    try {
        await db.insert(notifications).values({
            userId: userId,
            title,
            message,
            type,
            relatedId,
            isRead: 0
        });
        console.log(`🔔 Notification envoyée à l'utilisateur ${userId}: ${title}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de la notification:', error);
    }
};

module.exports = { notifyAdmins, notifyHRRecruiters, notifyUser };
