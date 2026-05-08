import { Request, Response } from 'express';
import { PlatformModel } from '../models/Platform';
import { BookingModel } from '../models/Booking';
import { ReviewModel } from '../models/Review';
import { validationResult } from 'express-validator';

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

function mapPlatform(dbPlatform: any, avgRatingFromReviews?: number) {
  if (!dbPlatform) return null;

  let rating = dbPlatform.rating;
  const reviewsCount = dbPlatform.reviews_count || 0;

  if (rating === 0 && reviewsCount > 0 && avgRatingFromReviews !== undefined) {
    rating = avgRatingFromReviews;
  } else if (rating === 0 && reviewsCount > 0) {

    rating = 5.0;
  }

  return {
    id: dbPlatform.id,
    name: dbPlatform.name,
    type: dbPlatform.type,
    address: dbPlatform.address,
    city: dbPlatform.city,
    pricePerDay: dbPlatform.price_per_day,
    rating: rating,
    reviewsCount: reviewsCount,
    image: dbPlatform.image,
    images: parseImages(dbPlatform.images),
    description: dbPlatform.description,
    size: dbPlatform.size,
    format: dbPlatform.format,
    illumination: dbPlatform.illumination,
    traffic: dbPlatform.traffic,
    available: dbPlatform.available,
    ownerId: dbPlatform.owner_id,
    status: dbPlatform.status,
    createdAt: dbPlatform.created_at,
    updatedAt: dbPlatform.updated_at,
  };
}

export const platformController = {
  async getAll(req: Request, res: Response) {
    try {
      const platforms = await PlatformModel.findActive();

      const platformsWithDates = await Promise.all(
        platforms.map(async (p) => {
          const bookedDates = await BookingModel.getBookedDates(p.id);

          let avgRating: number | undefined;
          const dbReviewsCount = (p as any).reviews_count || 0;
          const dbRating = (p as any).rating || 0;
          if (dbReviewsCount > 0 && dbRating === 0) {
            const reviews = await ReviewModel.findByPlatform(p.id);
            if (reviews.length > 0) {
              const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
              avgRating = parseFloat((sum / reviews.length).toFixed(1));
            }
          }

          const mapped = mapPlatform(p, avgRating);
          return {
            ...mapped,
            bookedDates
          };
        })
      );

      res.json(platformsWithDates);
    } catch (error) {
      console.error('Get platforms error:', error);
      res.status(500).json({ error: 'Failed to get platforms' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const platform = await PlatformModel.findById(id);

      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      const bookedDates = await BookingModel.getBookedDates(id);
      const reviews = await ReviewModel.findByPlatform(id);

      let avgRating: number | undefined;
      const dbReviewsCount = (platform as any).reviews_count || 0;
      const dbRating = (platform as any).rating || 0;
      if (dbReviewsCount > 0 && dbRating === 0 && reviews.length > 0) {
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        avgRating = parseFloat((sum / reviews.length).toFixed(1));
      }

      res.json({
        ...mapPlatform(platform, avgRating),
        bookedDates,
        reviews
      });
    } catch (error) {
      console.error('Get platform error:', error);
      res.status(500).json({ error: 'Failed to get platform' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const platformData = {
        ...req.body,
        ownerId: req.user!.userId,
        status: 'pending'
      };

      const platform = await PlatformModel.create(platformData);
      res.status(201).json({
        message: 'Platform created successfully and pending moderation',
        platform: mapPlatform(platform)
      });
    } catch (error) {
      console.error('Create platform error:', error);
      res.status(500).json({ error: 'Failed to create platform' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const platform = await PlatformModel.findById(id);

      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      if (platform.ownerId !== req.user!.userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this platform' });
      }

      await PlatformModel.update(id, req.body);
      const updated = await PlatformModel.findById(id);

      res.json({
        message: 'Platform updated successfully',
        platform: mapPlatform(updated)
      });
    } catch (error) {
      console.error('Update platform error:', error);
      res.status(500).json({ error: 'Failed to update platform' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const platform = await PlatformModel.findById(id);

      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      if (platform.ownerId !== req.user!.userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this platform' });
      }

      await PlatformModel.delete(id);
      res.json({ message: 'Platform deleted successfully' });
    } catch (error) {
      console.error('Delete platform error:', error);
      res.status(500).json({ error: 'Failed to delete platform' });
    }
  },

  async search(req: Request, res: Response) {
    try {
      const { q, city, type } = req.query as { q: string; city?: string; type?: string };

      if (!q) {
        return res.status(400).json({ error: 'Search query required' });
      }

      const platforms = await PlatformModel.search(q, city, type);
      const platformsWithDates = await Promise.all(
        platforms.map(async (p) => {
          const bookedDates = await BookingModel.getBookedDates(p.id);

          let avgRating: number | undefined;
          const dbReviewsCount = (p as any).reviews_count || 0;
          const dbRating = (p as any).rating || 0;
          if (dbReviewsCount > 0 && dbRating === 0) {
            const reviews = await ReviewModel.findByPlatform(p.id);
            if (reviews.length > 0) {
              const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
              avgRating = parseFloat((sum / reviews.length).toFixed(1));
            }
          }

          return {
            ...mapPlatform(p, avgRating),
            bookedDates
          };
        })
      );

      res.json(platformsWithDates);
    } catch (error) {
      console.error('Search platforms error:', error);
      res.status(500).json({ error: 'Failed to search platforms' });
    }
  },

  async getMyPlatforms(req: Request, res: Response) {
    try {
      const platforms = await PlatformModel.findByOwner(req.user!.userId);
      const platformsWithDates = await Promise.all(
        platforms.map(async (p) => {
          const bookedDates = await BookingModel.getBookedDates(p.id);

          let avgRating: number | undefined;
          const dbReviewsCount = (p as any).reviews_count || 0;
          const dbRating = (p as any).rating || 0;
          if (dbReviewsCount > 0 && dbRating === 0) {
            const reviews = await ReviewModel.findByPlatform(p.id);
            if (reviews.length > 0) {
              const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
              avgRating = parseFloat((sum / reviews.length).toFixed(1));
            }
          }

          return {
            ...mapPlatform(p, avgRating),
            bookedDates
          };
        })
      );
      res.json(platformsWithDates);
    } catch (error) {
      console.error('Get my platforms error:', error);
      res.status(500).json({ error: 'Failed to get platforms' });
    }
  },

  async getCities(req: Request, res: Response) {
    try {
      const [rows] = await (await import('../config/database')).pool.execute(
        'SELECT DISTINCT city FROM platforms WHERE status = "active" ORDER BY city'
      );
      res.json((rows as any[]).map(r => r.city));
    } catch (error) {
      console.error('Get cities error:', error);
      res.status(500).json({ error: 'Failed to get cities' });
    }
  },

  async addReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rating, text } = req.body;
      const userId = req.user!.userId;

      const platform = await PlatformModel.findById(id);
      if (!platform) {
        return res.status(404).json({ error: 'Platform not found' });
      }

      const review = await ReviewModel.create({
        platformId: id,
        userId,
        userName: req.user!.email,
        rating,
        text,
        date: new Date().toISOString().split('T')[0]
      });

      res.status(201).json({
        message: 'Review added successfully',
        review
      });
    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({ error: 'Failed to add review' });
    }
  },

  async getPopular(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const platforms = await PlatformModel.findPopular(limit);

      const platformsWithDates = await Promise.all(
        platforms.map(async (p) => {
          const bookedDates = await BookingModel.getBookedDates(p.id);
          let avgRating: number | undefined;
          const dbReviewsCount = (p as any).reviews_count || 0;
          const dbRating = (p as any).rating || 0;
          if (dbReviewsCount > 0 && dbRating === 0) {
            const reviews = await ReviewModel.findByPlatform(p.id);
            if (reviews.length > 0) {
              const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
              avgRating = parseFloat((sum / reviews.length).toFixed(1));
            }
          }

          return {
            ...mapPlatform(p, avgRating),
            bookedDates
          };
        })
      );

      res.json(platformsWithDates);
    } catch (error) {
      console.error('Get popular platforms error:', error);
      res.status(500).json({ error: 'Failed to get popular platforms' });
    }
  },

  async getNearby(req: Request, res: Response) {
    try {
      const { lat, lng, radius } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusKm = parseFloat(radius as string) || 50;

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: 'Invalid coordinates' });
      }

      const platforms = await PlatformModel.findNearby(latitude, longitude, radiusKm);

      const platformsWithDates = await Promise.all(
        platforms.map(async (p: any) => {
          const bookedDates = await BookingModel.getBookedDates(p.id);
          let avgRating: number | undefined;
          const dbReviewsCount = p.reviews_count || 0;
          const dbRating = p.rating || 0;
          if (dbReviewsCount > 0 && dbRating === 0) {
            const reviews = await ReviewModel.findByPlatform(p.id);
            if (reviews.length > 0) {
              const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
              avgRating = parseFloat((sum / reviews.length).toFixed(1));
            }
          }

          const mapped = mapPlatform(p, avgRating);
          return {
            ...mapped,
            bookedDates,
            distance: parseFloat(p.distance.toFixed(1))
          };
        })
      );

      res.json(platformsWithDates);
    } catch (error) {
      console.error('Get nearby platforms error:', error);
      res.status(500).json({ error: 'Failed to get nearby platforms' });
    }
  }
};
