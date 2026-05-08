import { Router } from 'express';
import { body } from 'express-validator';
import { adminController } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken, requireRole('admin', 'moderator'));

router.get('/stats', adminController.getStats);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/block', adminController.blockUser);
router.put('/users/:id/unblock', adminController.unblockUser);
router.delete('/users/:id', authenticateToken, requireRole('admin'), adminController.deleteUser);

router.get('/pending-platforms', adminController.getPendingPlatforms);
router.put('/platforms/:id/approve', adminController.approvePlatform);
router.put('/platforms/:id/reject', adminController.rejectPlatform);

router.get('/pending-materials', adminController.getPendingMaterials);

router.get('/pending-bookings', adminController.getPendingBookings);

router.get('/platforms', adminController.getAllPlatforms);
router.delete('/platforms/:id', authenticateToken, requireRole('admin'), adminController.deletePlatform);

router.get('/bookings', adminController.getAllBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);
router.delete('/bookings/:id', authenticateToken, requireRole('admin'), adminController.deleteBooking);

export default router;
