import { Router } from 'express';
import { favoriteController } from '../controllers/favoriteController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, favoriteController.getMyFavorites);
router.post('/:platformId', authenticateToken, favoriteController.toggle);
router.get('/:platformId/check', authenticateToken, favoriteController.check);

export default router;
