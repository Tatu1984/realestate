import prisma from './prisma'
import { logger } from './logger'
import { getRedis } from './redis'
import { sendEmail, emailTemplates } from './email'

// Notification types
export type NotificationType =
  | 'inquiry'
  | 'property_approved'
  | 'property_rejected'
  | 'membership_expiring'
  | 'membership_expired'
  | 'payment_success'
  | 'payment_failed'
  | 'new_message'
  | 'price_drop'
  | 'new_listing'
  | 'system'

interface CreateNotificationOptions {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, unknown>
  sendEmail?: boolean
}

// Create a notification
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  metadata,
  sendEmail: shouldSendEmail = false,
}: CreateNotificationOptions): Promise<boolean> {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    // Publish to Redis for real-time delivery
    const redis = getRedis()
    if (redis) {
      await redis.publish(
        `notifications:${userId}`,
        JSON.stringify({
          id: notification.id,
          type,
          title,
          message,
          link,
          createdAt: notification.createdAt,
        })
      )
    }

    // Send email if requested
    if (shouldSendEmail) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      })

      if (user) {
        await sendEmail({
          to: user.email,
          subject: title,
          html: `
            <h2>${title}</h2>
            <p>Hi ${user.name},</p>
            <p>${message}</p>
            ${link ? `<p><a href="${link}">View Details</a></p>` : ''}
          `,
        })
      }
    }

    logger.info('Notification created', { userId, type, notificationId: notification.id })
    return true
  } catch (error) {
    logger.error('Failed to create notification', error)
    return false
  }
}

// Get user notifications
export async function getUserNotifications(
  userId: string,
  options: {
    page?: number
    limit?: number
    unreadOnly?: boolean
  } = {}
): Promise<{
  notifications: Array<{
    id: string
    type: string
    title: string
    message: string
    link: string | null
    read: boolean
    createdAt: Date
  }>
  total: number
  unreadCount: number
}> {
  const { page = 1, limit = 20, unreadOnly = false } = options

  try {
    const where = {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ])

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt,
      })),
      total,
      unreadCount,
    }
  } catch (error) {
    logger.error('Failed to get notifications', error)
    return { notifications: [], total: 0, unreadCount: 0 }
  }
}

// Mark notification as read
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    })
    return true
  } catch (error) {
    logger.error('Failed to mark notification read', error)
    return false
  }
}

// Mark all notifications as read
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
    return true
  } catch (error) {
    logger.error('Failed to mark all notifications read', error)
    return false
  }
}

// Delete notification
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    })
    return true
  } catch (error) {
    logger.error('Failed to delete notification', error)
    return false
  }
}

// Send inquiry notification
export async function notifyInquiry(
  propertyOwnerId: string,
  propertyTitle: string,
  inquirerName: string,
  inquirerEmail: string,
  message: string
): Promise<void> {
  await createNotification({
    userId: propertyOwnerId,
    type: 'inquiry',
    title: 'New Inquiry Received',
    message: `${inquirerName} is interested in your property "${propertyTitle}"`,
    metadata: {
      inquirerName,
      inquirerEmail,
      message,
    },
    sendEmail: true,
  })
}

// Send property approval notification
export async function notifyPropertyApproved(
  userId: string,
  propertyId: string,
  propertyTitle: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'property_approved',
    title: 'Property Approved',
    message: `Your property "${propertyTitle}" has been approved and is now live!`,
    link: `/property/${propertyId}`,
    sendEmail: true,
  })
}

// Send property rejection notification
export async function notifyPropertyRejected(
  userId: string,
  propertyTitle: string,
  reason?: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'property_rejected',
    title: 'Property Not Approved',
    message: `Your property "${propertyTitle}" was not approved. ${reason || 'Please review and update your listing.'}`,
    sendEmail: true,
  })
}

// Send membership expiring notification
export async function notifyMembershipExpiring(
  userId: string,
  daysLeft: number,
  planName: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'membership_expiring',
    title: 'Membership Expiring Soon',
    message: `Your ${planName} membership will expire in ${daysLeft} days. Renew now to continue enjoying premium features.`,
    link: '/dashboard/membership',
    sendEmail: true,
  })
}

// Send payment success notification
export async function notifyPaymentSuccess(
  userId: string,
  amount: number,
  description: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'payment_success',
    title: 'Payment Successful',
    message: `Your payment of ₹${amount.toLocaleString()} for ${description} was successful.`,
    link: '/dashboard/transactions',
    sendEmail: true,
  })
}

// Send payment failed notification
export async function notifyPaymentFailed(
  userId: string,
  amount: number,
  description: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'payment_failed',
    title: 'Payment Failed',
    message: `Your payment of ₹${amount.toLocaleString()} for ${description} could not be processed. Please try again.`,
    link: '/dashboard/membership',
    sendEmail: true,
  })
}

// Send price drop alert to users who favorited a property
export async function notifyPriceDrop(
  propertyId: string,
  propertyTitle: string,
  oldPrice: number,
  newPrice: number
): Promise<void> {
  try {
    // Get all users who favorited this property
    const favorites = await prisma.favorite.findMany({
      where: { propertyId },
      select: { userId: true },
    })

    const percentDrop = Math.round(((oldPrice - newPrice) / oldPrice) * 100)

    for (const favorite of favorites) {
      await createNotification({
        userId: favorite.userId,
        type: 'price_drop',
        title: 'Price Drop Alert',
        message: `"${propertyTitle}" price dropped by ${percentDrop}%! Now available at ₹${newPrice.toLocaleString()}`,
        link: `/property/${propertyId}`,
        metadata: { oldPrice, newPrice, percentDrop },
        sendEmail: true,
      })
    }
  } catch (error) {
    logger.error('Failed to send price drop notifications', error)
  }
}

// Subscribe to real-time notifications (for WebSocket connection)
export async function subscribeToNotifications(
  userId: string,
  callback: (notification: unknown) => void
): Promise<() => void> {
  const redis = getRedis()

  if (!redis) {
    logger.warn('Redis not available for real-time notifications')
    return () => {}
  }

  // Create a subscriber connection
  const subscriber = redis.duplicate()
  const channel = `notifications:${userId}`

  await subscriber.subscribe(channel)

  subscriber.on('message', (_channel, message) => {
    try {
      const notification = JSON.parse(message)
      callback(notification)
    } catch (error) {
      logger.error('Failed to parse notification message', error)
    }
  })

  // Return unsubscribe function
  return async () => {
    await subscriber.unsubscribe(channel)
    subscriber.disconnect()
  }
}
