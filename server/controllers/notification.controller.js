const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const where = { userId: req.user.id };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.notification.count({ where });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Mark as Read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Use updateMany to ensure we only update if it belongs to user
    // Prisma update requires unique identifier, so we check existence first or use updateMany
    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      data: { notification: updated }
    });
  } catch (error) {
    next(error);
  }
};

// Update Preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    // Note: Prisma schema User model does not seem to have 'preferences' field based on schema file?
    // User model has: notificationEmail, notificationSms, notificationPush booleans.
    const { notificationEmail, notificationSms, notificationPush } = req.body;

    // Construct update data
    const data = {};
    if (notificationEmail !== undefined) data.notificationEmail = notificationEmail;
    if (notificationSms !== undefined) data.notificationSms = notificationSms;
    if (notificationPush !== undefined) data.notificationPush = notificationPush;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data
    });

    res.json({
      success: true,
      data: {
        preferences: {
          notificationEmail: user.notificationEmail,
          notificationSms: user.notificationSms,
          notificationPush: user.notificationPush
        }
      },
      message: 'Notification preferences updated'
    });
  } catch (error) {
    next(error);
  }
};

