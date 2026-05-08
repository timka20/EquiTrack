import { Router } from 'express';
import { NotificationModel } from '../models/Notification';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await NotificationModel.findByUser(req.user!.userId);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await NotificationModel.countUnread(req.user!.userId);
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await NotificationModel.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    if (notification.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await NotificationModel.markAsRead(req.params.id);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await NotificationModel.markAllAsRead(req.user!.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await NotificationModel.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    if (notification.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await NotificationModel.delete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
