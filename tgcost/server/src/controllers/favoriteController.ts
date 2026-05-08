import { Request, Response } from 'express';
import { FavoriteModel } from '../models/Favorite';
import { BookingModel } from '../models/Booking';

function parseImages(images: any): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    const parsed = JSON.parse(images as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export const favoriteController = {
  async getMyFavorites(req: Request, res: Response) {
    try {
      const favorites = await FavoriteModel.findByUser(req.user!.userId);

      const favoritesWithDates = await Promise.all(
        favorites.map(async (f) => {
          const bookedDates = await BookingModel.getBookedDates(f.id);
          return {
            ...f,
            images: parseImages(f.images),
            bookedDates
          };
        })
      );

      res.json(favoritesWithDates);
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({ error: 'Failed to get favorites' });
    }
  },

  async toggle(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const isFavorite = await FavoriteModel.toggle(req.user!.userId, platformId);

      res.json({
        message: isFavorite ? 'Added to favorites' : 'Removed from favorites',
        isFavorite
      });
    } catch (error) {
      console.error('Toggle favorite error:', error);
      res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  },

  async check(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const isFavorite = await FavoriteModel.isFavorite(req.user!.userId, platformId);

      res.json({ isFavorite });
    } catch (error) {
      console.error('Check favorite error:', error);
      res.status(500).json({ error: 'Failed to check favorite' });
    }
  }
};
