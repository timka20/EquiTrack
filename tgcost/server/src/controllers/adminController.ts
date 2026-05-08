import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { PlatformModel } from '../models/Platform';
import { BookingModel } from '../models/Booking';
import { pool } from '../config/database';
import { notificationService } from '../services/notificationService';

export const adminController = {
  async getStats(req: Request, res: Response) {
    try {
      const usersCount = await UserModel.count();
      const platformsCount = await PlatformModel.count('active');
      const pendingPlatformsCount = await PlatformModel.count('pending');
      const bookingsCount = await BookingModel.count();

      const [pendingMaterials] = await pool.execute(
        'SELECT COUNT(*) as count FROM bookings WHERE material_status = "pending"'
      );

      res.json({
        usersCount,
        platformsCount,
        pendingModerationCount: pendingPlatformsCount + (pendingMaterials as any[])[0].count,
        bookingsCount,
        pendingPlatforms: pendingPlatformsCount,
        pendingMaterials: (pendingMaterials as any[])[0].count
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  },

  async getUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.findAll();
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  },

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  },

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, role, status, phone, company } = req.body;

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await UserModel.update(id, { name, email, role, status, phone, company });
      const updated = await UserModel.findById(id);

      res.json({
        message: 'User updated successfully',
        user: updated
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  },

  async blockUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await UserModel.update(id, { status: 'blocked' });
      res.json({ message: 'User blocked successfully' });
    } catch (error) {
      console.error('Block user error:', error);
      res.status(500).json({ error: 'Failed to block user' });
    }
  },

  async unblockUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await UserModel.update(id, { status: 'active' });
      res.json({ message: 'User unblocked successfully' });
    } catch (error) {
      console.error('Unblock user error:', error);
      res.status(500).json({ error: 'Failed to unblock user' });
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (id === req.user!.userId) {
        return res.status(400).json({ error: 'Cannot delete yourself' });
      }

      await UserModel.delete(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  },

  async getPendingPlatforms(req: Request, res: Response) {
    try {
      const platforms = await PlatformModel.findPending();

      const platformsWithOwner = await Promise.all(
        platforms.map(async (p) => {
          let ownerName = 'Unknown';
          if (p.ownerId) {
            const owner = await UserModel.findById(p.ownerId);
            ownerName = owner?.name || 'Unknown';
          }

          let images = [];
          try {
            images = JSON.parse((p.images as unknown as string) || '[]');
          } catch (e) {
            images = [];
          }

          return {
            ...p,
            images,
            ownerName
          };
        })
      );

      res.json(platformsWithOwner);
    } catch (error) {
      console.error('Get pending platforms error:', error);
      res.status(500).json({ error: 'Failed to get pending platforms' });
    }
  },

  async approvePlatform(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const platform = await PlatformModel.findById(id);
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      await PlatformModel.approve(id);

      if (platform.ownerId) {
        await notificationService.sendPlatformApprovedNotification(
          platform.ownerId,
          platform.name,
          platform.id
        );
      }

      res.json({ message: 'Platform approved successfully' });
    } catch (error) {
      console.error('Approve platform error:', error);
      res.status(500).json({ error: 'Failed to approve platform' });
    }
  },

  async rejectPlatform(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const platform = await PlatformModel.findById(id);
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      await PlatformModel.reject(id);
      res.json({ message: 'Platform rejected successfully' });
    } catch (error) {
      console.error('Reject platform error:', error);
      res.status(500).json({ error: 'Failed to reject platform' });
    }
  },

  async getPendingMaterials(req: Request, res: Response) {
    try {
      const materials = await BookingModel.getPendingMaterials();
      res.json(materials);
    } catch (error) {
      console.error('Get pending materials error:', error);
      res.status(500).json({ error: 'Failed to get pending materials' });
    }
  },

  async getPendingBookings(req: Request, res: Response) {
    try {
      const bookings = await BookingModel.getPendingBookings();
      res.json(bookings);
    } catch (error) {
      console.error('Get pending bookings error:', error);
      res.status(500).json({ error: 'Failed to get pending bookings' });
    }
  },

  async getAllBookings(req: Request, res: Response) {
    try {
      const bookings = await BookingModel.findAll();
      res.json(bookings);
    } catch (error) {
      console.error('Get all bookings error:', error);
      res.status(500).json({ error: 'Failed to get bookings' });
    }
  },

  async getAllPlatforms(req: Request, res: Response) {
    try {
      const platforms = await PlatformModel.findAll();

      const platformsWithDetails = await Promise.all(
        platforms.map(async (p) => {
          let ownerName = 'Unknown';
          if (p.ownerId) {
            const owner = await UserModel.findById(p.ownerId);
            ownerName = owner?.name || 'Unknown';
          }

          let images = [];
          try {
            images = JSON.parse((p.images as unknown as string) || '[]');
          } catch (e) {
            images = [];
          }

          const bookedDates = await BookingModel.getBookedDates(p.id);
          return {
            ...p,
            images,
            bookedDates,
            ownerName
          };
        })
      );

      res.json(platformsWithDetails);
    } catch (error) {
      console.error('Get all platforms error:', error);
      res.status(500).json({ error: 'Failed to get platforms' });
    }
  },

  async deletePlatform(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const platform = await PlatformModel.findById(id);
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      await PlatformModel.delete(id);
      res.json({ message: 'Platform deleted successfully' });
    } catch (error) {
      console.error('Delete platform error:', error);
      res.status(500).json({ error: 'Failed to delete platform' });
    }
  },

  async updateBookingStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const booking = await BookingModel.findById(id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      await BookingModel.updateStatus(id, status);

      const platform = await PlatformModel.findById(booking.platformId);
      if (platform) {
        if (status === 'confirmed') {
          await notificationService.sendBookingApprovedNotification(
            booking.userId,
            platform.name,
            booking.id
          );
        } else if (status === 'cancelled') {
          await notificationService.sendBookingRejectedNotification(
            booking.userId,
            platform.name,
            booking.id,
            'Бронирование отклонено администратором'
          );
        }
      }

      res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({ error: 'Failed to update booking status' });
    }
  },

  async deleteBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const booking = await BookingModel.findById(id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      await BookingModel.delete(id);
      res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
      console.error('Delete booking error:', error);
      res.status(500).json({ error: 'Failed to delete booking' });
    }
  }
};
