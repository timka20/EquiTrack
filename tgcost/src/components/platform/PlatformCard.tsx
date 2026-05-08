import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Heart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { cn } from '@/lib/utils';
import type { Platform } from '@/store/usePlatformsStore';

interface PlatformCardProps {
  platform: Platform;
  index?: number;
}

const platformTypeLabels: Record<string, string> = {
  billboard: 'Билборд',
  digital_screen: 'Цифровой экран',
  wall: 'Стена',
  mall: 'ТЦ',
  transport: 'Транспорт',
};

export function PlatformCard({ platform, index = 0 }: PlatformCardProps) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const [isToggling, setIsToggling] = useState(false);

  if (!platform) {
    return null;
  }

  const id = platform.id || '';
  const name = platform.name || 'Без названия';
  const type = platform.type || 'billboard';
  const price = typeof platform.pricePerDay === 'number' ? platform.pricePerDay : 0;
  const rating = typeof platform.rating === 'number' ? platform.rating : 0;
  const reviewsCount = typeof platform.reviewsCount === 'number' ? platform.reviewsCount : 0;
  const address = platform.address || 'Адрес не указан';
  const city = platform.city || 'Город не указан';
  const image = platform.image || 'https://via.placeholder.com/400x300?text=No+Image';
  const isAvailable = platform.available !== false;

  const favorite = id ? isFavorite(id) : false;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isToggling || !id) return;

    setIsToggling(true);
    await toggleFavorite(id);
    setIsToggling(false);
  };

  const handleBookingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAvailable && id) {
      navigate(`/booking/${id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(!isAvailable && "opacity-60")}
    >
      <div className="group relative">
        {}
        {!isAvailable && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-2xl pointer-events-none">
            <span className="bg-destructive text-white px-4 py-2 rounded-full font-semibold text-lg">
              Занят
            </span>
          </div>
        )}

        {}
        <Link to={`/platform/${id}`} className="block">
          <div className="overflow-hidden rounded-2xl bg-card card-shadow-hover">
            {}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />

              {}
              <button
                onClick={handleFavoriteClick}
                disabled={isToggling}
                className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                {isToggling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart
                    className={cn(
                      'h-5 w-5 transition-colors',
                      favorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                    )}
                  />
                )}
              </button>

              <Badge className="absolute left-3 top-3 bg-card/90 text-foreground backdrop-blur-sm z-10">
                {platformTypeLabels[type] || type}
              </Badge>
            </div>

            {}
            <div className="p-4 pb-16">
              <div className="mb-1 flex items-start justify-between">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                  {name}
                </h3>
              </div>

              <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{address}, {city}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {price > 0 ? (
                    <span className="text-base font-bold text-foreground">
                      {price.toLocaleString('ru-RU')} ₽
                      <span className="text-xs text-muted-foreground font-normal"> / сутки</span>
                    </span>
                  ) : (
                    <span className="text-base font-bold text-foreground">Цена по запросу</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>

        {}
        {id && (
          <div className="absolute bottom-4 right-4 z-40">
            <Button
              size="sm"
              disabled={!isAvailable}
              variant={isAvailable ? "default" : "secondary"}
              onClick={handleBookingClick}
              className="shadow-lg"
            >
              {isAvailable ? 'Забронировать' : 'Занят'}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
