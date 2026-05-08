import { create } from 'zustand';
import { api } from '@/services/api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'material' | 'system' | 'platform';
  read: boolean;
  data?: any;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  deleteNotification: (id: string) => Promise<void>;
  clearNotifications: () => void;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await api.getNotifications();
      set({
        notifications,
        unreadCount: notifications.filter((n: Notification) => !n.read).length,
        isLoading: false
      });

      localStorage.setItem('tgcost_notifications', JSON.stringify(notifications));
    } catch (error: any) {

      const stored = localStorage.getItem('tgcost_notifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        set({
          notifications,
          unreadCount: notifications.filter((n: Notification) => !n.read).length,
          isLoading: false
        });
      } else {
        set({ error: error.message, isLoading: false });
      }
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { count } = await api.getUnreadNotificationsCount();
      set({ unreadCount: count });
    } catch (error) {

    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      const { notifications } = get();
      const updated = notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem('tgcost_notifications', JSON.stringify(updated));
      set({
        notifications: updated,
        unreadCount: updated.filter(n => !n.read).length
      });
    } catch (error: any) {
      console.error('Failed to mark as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.markAllNotificationsAsRead();
      const { notifications } = get();
      const updated = notifications.map(n => ({ ...n, read: true }));
      localStorage.setItem('tgcost_notifications', JSON.stringify(updated));
      set({
        notifications: updated,
        unreadCount: 0
      });
    } catch (error: any) {
      console.error('Failed to mark all as read:', error);
    }
  },

  addNotification: (notification: Notification) => {
    const { notifications } = get();
    const updated = [notification, ...notifications];
    localStorage.setItem('tgcost_notifications', JSON.stringify(updated));
    set({
      notifications: updated,
      unreadCount: updated.filter(n => !n.read).length
    });
  },

  deleteNotification: async (id: string) => {
    try {
      await api.deleteNotification(id);
      const { notifications } = get();
      const updated = notifications.filter(n => n.id !== id);
      localStorage.setItem('tgcost_notifications', JSON.stringify(updated));
      set({
        notifications: updated,
        unreadCount: updated.filter(n => !n.read).length
      });
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
    }
  },

  clearNotifications: () => {
    localStorage.removeItem('tgcost_notifications');
    set({ notifications: [], unreadCount: 0 });
  },
}));
