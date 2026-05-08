import { Router } from 'express';
import { body } from 'express-validator';
import { platformController } from '../controllers/platformController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', platformController.getAll);
router.get('/search', platformController.search);
router.get('/cities', platformController.getCities);
router.get('/popular', platformController.getPopular);
router.get('/nearby', platformController.getNearby);

router.get('/my/platforms', authenticateToken, platformController.getMyPlatforms);

router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 2 }),
  body('type').isIn(['billboard', 'digital_screen', 'wall', 'mall', 'transport']),
  body('address').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('pricePerDay').isInt({ min: 1 }),
  body('image').optional(),
  body('description').trim().optional()
], platformController.create);

router.put('/:id', authenticateToken, platformController.update);
router.delete('/:id', authenticateToken, platformController.delete);

router.get('/:id', platformController.getById);

router.post('/:id/reviews', authenticateToken, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('text').trim().optional()
], platformController.addReview);

export default router;
