import { NotificationModel, NotificationType } from '../models/Notification';

export const notificationService = {

  async sendWelcomeNotification(userId: string, userName: string) {
    return await NotificationModel.create({
      userId,
      title: 'Добро пожаловать в TGCost! 👋',
      message: `Привет, ${userName}! Мы рады приветствовать вас на платформе. Здесь вы можете найти и забронировать рекламные площадки для вашего бизнеса. Начните с поиска площадок в вашем городе!`,
      type: 'system' as NotificationType,
      read: false,
      data: { action: 'explore', link: '/search' }
    });
  },

  async sendBookingCreatedNotification(userId: string, platformName: string, bookingId: string) {
    return await NotificationModel.create({
      userId,
      title: 'Бронирование создано ⏳',
      message: `Ваше бронирование площадки "${platformName}" успешно создано и ожидает модерации. Мы уведомим вас после проверки.`,
      type: 'booking' as NotificationType,
      read: false,
      data: { bookingId, status: 'pending', platformName }
    });
  },

  async sendBookingApprovedNotification(userId: string, platformName: string, bookingId: string) {
    return await NotificationModel.create({
      userId,
      title: 'Бронирование одобрено ✅',
      message: `Поздравляем! Ваше бронирование площадки "${platformName}" было одобрено модератором. Теперь вы можете загрузить рекламные материалы.`,
      type: 'booking' as NotificationType,
      read: false,
      data: { bookingId, status: 'approved', platformName, action: 'upload' }
    });
  },

  async sendBookingRejectedNotification(userId: string, platformName: string, bookingId: string, reason?: string) {
    return await NotificationModel.create({
      userId,
      title: 'Бронирование отклонено ❌',
      message: `К сожалению, ваше бронирование площадки "${platformName}" было отклонено. ${reason ? `Причина: ${reason}` : 'Обратитесь в поддержку для уточнения деталей.'}`,
      type: 'booking' as NotificationType,
      read: false,
      data: { bookingId, status: 'rejected', platformName, reason }
    });
  },

  async sendMaterialUploadedNotification(userId: string, platformName: string, bookingId: string) {
    return await NotificationModel.create({
      userId,
      title: 'Материалы на модерации ⏳',
      message: `Рекламные материалы для площадки "${platformName}" загружены и отправлены на модерацию. Ожидайте подтверждения.`,
      type: 'material' as NotificationType,
      read: false,
      data: { bookingId, status: 'pending', platformName }
    });
  },

  async sendMaterialApprovedNotification(userId: string, platformName: string, bookingId: string) {
    return await NotificationModel.create({
      userId,
      title: 'Материалы одобрены ✅',
      message: `Отличные новости! Ваши рекламные материалы для площадки "${platformName}" одобрены модератором. Размещение подтверждено!`,
      type: 'material' as NotificationType,
      read: false,
      data: { bookingId, status: 'approved', platformName }
    });
  },

  async sendMaterialRejectedNotification(userId: string, platformName: string, bookingId: string, reason?: string) {
    return await NotificationModel.create({
      userId,
      title: 'Материалы отклонены ❌',
      message: `Рекламные материалы для площадки "${platformName}" требуют доработки. ${reason ? `Причина: ${reason}` : 'Пожалуйста, загрузите исправленный вариант.'}`,
      type: 'material' as NotificationType,
      read: false,
      data: { bookingId, status: 'rejected', platformName, reason, action: 'reupload' }
    });
  },

  async sendProfileUpdatedNotification(userId: string) {
    return await NotificationModel.create({
      userId,
      title: 'Профиль обновлен ✅',
      message: 'Ваши данные профиля успешно изменены и сохранены.',
      type: 'system' as NotificationType,
      read: false,
      data: { action: 'view_profile' }
    });
  },

  async sendNewBookingToOwner(ownerId: string, platformName: string, bookingId: string, userName: string) {
    return await NotificationModel.create({
      userId: ownerId,
      title: 'Новое бронирование 🎉',
      message: `Пользователь ${userName} забронировал вашу площадку "${platformName}". Проверьте детали и подтвердите бронирование.`,
      type: 'booking' as NotificationType,
      read: false,
      data: { bookingId, platformName, userName, action: 'review' }
    });
  },

  async sendNewMaterialToOwner(ownerId: string, platformName: string, bookingId: string) {
    return await NotificationModel.create({
      userId: ownerId,
      title: 'Новые материалы на модерацию 📋',
      message: `Загружены рекламные материалы для площадки "${platformName}". Проверьте и одобрите размещение.`,
      type: 'material' as NotificationType,
      read: false,
      data: { bookingId, platformName, action: 'moderate' }
    });
  },

  async sendPlatformPendingNotification(adminIds: string[], platformName: string, platformId: string) {
    for (const adminId of adminIds) {
      await NotificationModel.create({
        userId: adminId,
        title: 'Новая площадка на модерацию 📋',
        message: `Добавлена новая площадка "${platformName}". Требуется проверка перед публикацией.`,
        type: 'platform' as NotificationType,
        read: false,
        data: { platformId, platformName, action: 'moderate_platform' }
      });
    }
  },

  async sendPlatformApprovedNotification(ownerId: string, platformName: string, platformId: string) {
    return await NotificationModel.create({
      userId: ownerId,
      title: 'Площадка одобрена ✅',
      message: `Ваша площадка "${platformName}" одобрена и опубликована. Теперь она доступна для бронирования!`,
      type: 'platform' as NotificationType,
      read: false,
      data: { platformId, platformName, action: 'view_platform' }
    });
  }
};
