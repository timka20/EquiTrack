import { FastifyRequest, FastifyReply } from 'fastify';
import { messageService, notificationService } from '../services/messageService.js';

export class MessageController {
  async getInbox(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const messages = await messageService.getInbox(request.user.id);
      return reply.send(messages);
    } catch (error) {
      console.error('Get inbox error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getSent(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const messages = await messageService.getSent(request.user.id);
      return reply.send(messages);
    } catch (error) {
      console.error('Get sent error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const { id } = request.params as { id: string };
      const message = await messageService.getMessage(parseInt(id), request.user.id);

      if (!message) {
        return reply.status(404).send({ error: 'Message not found' });
      }

      return reply.send(message);
    } catch (error) {
      console.error('Get message error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const { receiverId, subject, content } = request.body as {
        receiverId: number;
        subject: string;
        content: string;
      };

      const message = await messageService.createMessage({
        senderId: request.user.id,
        receiverId,
        subject,
        content
      });

      return reply.status(201).send(message);
    } catch (error) {
      console.error('Create message error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const { id } = request.params as { id: string };
      const deleted = await messageService.deleteMessage(parseInt(id), request.user.id);

      if (!deleted) {
        return reply.status(404).send({ error: 'Message not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Delete message error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const count = await messageService.getUnreadCount(request.user.id);
      return reply.send({ count });
    } catch (error) {
      console.error('Get unread count error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getNotifications(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const { unread } = request.query as { unread?: string };
      const notifications = await notificationService.getNotifications(request.user.id, unread === 'true');
      return reply.send(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async markNotificationAsRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const { id } = request.params as { id: string };
      const updated = await notificationService.markAsRead(parseInt(id), request.user.id);

      if (!updated) {
        return reply.status(404).send({ error: 'Notification not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async markAllNotificationsAsRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      await notificationService.markAllAsRead(request.user.id);
      return reply.send({ success: true });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async deleteNotification(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const { id } = request.params as { id: string };
      const deleted = await notificationService.deleteNotification(parseInt(id), request.user.id);

      if (!deleted) {
        return reply.status(404).send({ error: 'Notification not found' });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Delete notification error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async getUnreadNotificationsCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
      }

      const count = await notificationService.getUnreadCount(request.user.id);
      return reply.send({ count });
    } catch (error) {
      console.error('Get unread notifications count error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}

export const messageController = new MessageController();
