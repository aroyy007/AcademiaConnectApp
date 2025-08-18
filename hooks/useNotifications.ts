import { useEffect, useState } from 'react';
import { db, realtime } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'friend_request' | 'post_mention' | 'announcement' | 'schedule_change' | 'post_like' | 'post_comment';
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await db.notifications.getAll(userId);
      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await db.notifications.markAsRead(notificationId);
      if (error) throw error;

      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return { error: new Error('No user ID') };

    try {
      const { error } = await db.notifications.markAllAsRead(userId);
      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'created_at'>) => {
    try {
      const { error } = await db.notifications.create(notification);
      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    if (userId) {
      loadNotifications();

      // Subscribe to real-time notifications
      const subscription = realtime.subscribeToNotifications(userId, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
    refresh: loadNotifications,
  };
}