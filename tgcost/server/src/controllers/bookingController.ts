import { Request, Response } from 'express';
import { BookingModel } from '../models/Booking';
import { PlatformModel } from '../models/Platform';
import { UserModel } from '../models/User';
import { validationResult } from 'express-validator';
import { notificationService } from '../services/notificationService';

export const bookingController = {
  async getMyBookings(req: Request, res: Response) {
    try {
      const bookings = await BookingModel.findByUser(req.user!.userId);
      res.json(bookings);
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({ error: 'Failed to get bookings' });
    }
  },

  async getPlatformBookings(req: Request, res: Response) {
    try {
      const { platformId } = req.params;

      const platform = await PlatformModel.findById(platformId);
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      if (platform.ownerId !== req.user!.userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const bookings = await BookingModel.findByPlatform(platformId);
      res.json(bookings);
    } catch (error) {
      console.error('Get platform bookings error:', error);
      res.status(500).json({ error: 'Failed to get bookings' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { platformId, startDate, endDate } = req.body;

      const platform = await PlatformModel.findById(platformId);
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      if (platform.status !== 'active') {
        return res.status(400).json({ error: 'Platform is not available' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const dates: string[] = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
      }

      for (const date of dates) {
        const isAvailable = await BookingModel.isDateAvailable(platformId, date);
        if (!isAvailable) {
          return res.status(400).json({ error: `Date ${date} is not available` });
        }
      }

      const daysCount = dates.length;
      const totalPrice = daysCount * platform.pricePerDay;

      const booking = await BookingModel.create({
        platformId,
        userId: req.user!.userId,
        startDate,
        endDate,
        totalPrice,
        status: 'pending',
        materialStatus: 'none'
      });

      await notificationService.sendBookingCreatedNotification(
        req.user!.userId,
        platform.name,
        booking.id
      );

      const user = await UserModel.findById(req.user!.userId);
      if (platform.ownerId && user) {
        await notificationService.sendNewBookingToOwner(
          platform.ownerId,
          platform.name,
          booking.id,
          user.name
        );
      }

      res.status(201).json({
        message: 'Booking created successfully',
        booking
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  },

  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const booking = await BookingModel.findById(id);

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.userId !== req.user!.userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      if (booking.status === 'cancelled') {
        return res.status(400).json({ error: 'Booking already cancelled' });
      }

      await BookingModel.cancel(id);
      res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const booking = await BookingModel.findById(id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const platform = await PlatformModel.findById(booking.platformId);
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      if (platform.ownerId !== req.user!.userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await BookingModel.updateStatus(id, status);
      res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({ error: 'Failed to update booking status' });
    }
  },

  async uploadMaterial(req: Request, res: Response) {
    try {
      const { id } = req.params;

      console.log('📤 Upload material request for booking:', id);

      if (!req.file) {
        console.log('❌ No file in request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('📄 File received:', req.file.filename, 'size:', req.file.size);

      const booking = await BookingModel.findById(id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.userId !== req.user!.userId) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const platform = await PlatformModel.findById(booking.platformId);
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      const materialUrl = `/uploads/materials/${req.file.filename}`;
      await BookingModel.updateMaterialUrl(id, materialUrl);

      await notificationService.sendMaterialUploadedNotification(
        booking.userId,
        platform.name,
        booking.id
      );

      if (platform.ownerId) {
        await notificationService.sendNewMaterialToOwner(
          platform.ownerId,
          platform.name,
          booking.id
        );
      }

      res.json({
        message: 'Material uploaded successfully',
        materialUrl
      });
    } catch (error) {
      console.error('Upload material error:', error);
      res.status(500).json({ error: 'Failed to upload material' });
    }
  },

  async approveMaterial(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const booking = await BookingModel.findById(id);

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const platform = await PlatformModel.findById(booking.platformId);
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      if (platform.ownerId !== req.user!.userId &&
          req.user!.role !== 'admin' &&
          req.user!.role !== 'moderator') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await BookingModel.updateMaterialStatus(id, 'approved');

      await notificationService.sendMaterialApprovedNotification(
        booking.userId,
        platform.name,
        booking.id
      );

      res.json({ message: 'Material approved successfully' });
    } catch (error) {
      console.error('Approve material error:', error);
      res.status(500).json({ error: 'Failed to approve material' });
    }
  },

  async rejectMaterial(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const booking = await BookingModel.findById(id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const platform = await PlatformModel.findById(booking.platformId);
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      if (platform.ownerId !== req.user!.userId &&
          req.user!.role !== 'admin' &&
          req.user!.role !== 'moderator') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await BookingModel.updateMaterialStatus(id, 'rejected', reason);

      await notificationService.sendMaterialRejectedNotification(
        booking.userId,
        platform.name,
        booking.id,
        reason
      );

      res.json({ message: 'Material rejected successfully' });
    } catch (error) {
      console.error('Reject material error:', error);
      res.status(500).json({ error: 'Failed to reject material' });
    }
  }
};
