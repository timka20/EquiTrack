import { Router } from 'express';
import { body } from 'express-validator';
import { bookingController } from '../controllers/bookingController';
import { authenticateToken, requireRole } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'materials');
    console.log('📁 Upload destination:', uploadDir);
    if (!fs.existsSync(uploadDir)) {
      console.log('📁 Creating upload directory...');
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    console.log('📄 File will be saved as:', uniqueName);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images and videos are allowed'));
  }
});

const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 50MB)' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

const router = Router();

router.get('/my', authenticateToken, bookingController.getMyBookings);

router.get('/platform/:platformId', authenticateToken, bookingController.getPlatformBookings);

router.post('/', authenticateToken, [
  body('platformId').notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], bookingController.create);

router.put('/:id/cancel', authenticateToken, bookingController.cancel);

router.put('/:id/status', authenticateToken, [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled'])
], bookingController.updateStatus);

router.post('/:id/material', authenticateToken, upload.single('material'), handleUploadError, bookingController.uploadMaterial);

router.put('/:id/material/approve', authenticateToken, bookingController.approveMaterial);
router.put('/:id/material/reject', authenticateToken, [
  body('reason').trim().notEmpty()
], bookingController.rejectMaterial);

export default router;
