import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MapPin,
  Heart,
  Share2,
  ChevronRight,
  Lightbulb,
  Ruler,
  Eye,
  Users,
  Loader2,
  X,
  MessageSquare,
  Send,
  ThumbsUp,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { usePlatformsStore } from '@/store/usePlatformsStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useAuthStore } from '@/store/useAuthStore';

const platformTypeLabels: Record<string, string> = {
  billboard: 'Билборд',
  digital_screen: 'Цифровой экран',
  wall: 'Стена',
  mall: 'ТЦ',
  transport: 'Транспорт',
};

function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} ${one}`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} ${few}`;
  }
  return `${count} ${many}`;
}

export default function PlatformDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);

  const { currentPlatform: platform, reviews, isLoading, error, fetchPlatform, clearCurrentPlatform, addReview } = usePlatformsStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchPlatform(id);
    }
    return () => {
      clearCurrentPlatform();
    };
  }, [id, fetchPlatform, clearCurrentPlatform]);

  const handleFavoriteClick = async () => {
    if (platform?.id) {
      await toggleFavorite(platform.id);
    }
  };

  const handleAddReview = async (rating: number, text: string) => {
    if (id && rating) {
      const success = await addReview(id, { rating, text });
      if (success) {
        setShowAddReview(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <Button onClick={() => navigate(-1)}>Назад</Button>
        </div>
      </div>
    );
  }

  if (!platform) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Площадка не найдена</p>
      </div>
    );
  }

  const price = typeof platform.pricePerDay === 'number' ? platform.pricePerDay : 0;
  const rating = typeof platform.rating === 'number' ? platform.rating : 0;
  const reviewsCount = typeof platform.reviewsCount === 'number' ? platform.reviewsCount : 0;
  const address = platform.address || 'Адрес не указан';
  const city = platform.city || 'Город не указан';
  const description = platform.description || 'Описание отсутствует';
  const isAvailable = platform.available !== false;
  const platformId = platform.id || id || '';

  const favorite = platformId ? isFavorite(platformId) : false;

  const images = platform.images && platform.images.length > 0
    ? platform.images
    : [platform.image || 'https://via.placeholder.com/800x600?text=No+Image'];

  return (
    <div className="min-h-screen bg-background pb-28">
      {}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="aspect-[4/3] w-full overflow-hidden"
        >
          <img
            src={images[currentImage]}
            alt={platform.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=No+Image';
            }}
          />
        </motion.div>

        {}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleFavoriteClick}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm"
            >
              <Heart className={`h-5 w-5 ${favorite ? 'fill-destructive text-destructive' : ''}`} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  currentImage === index ? 'w-4 bg-card' : 'bg-card/50'
                }`}
              />
            ))}
          </div>
        )}

        {}
        {!isAvailable && (
          <div className="absolute bottom-4 right-4 rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground">
            Занято
          </div>
        )}
      </div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 pt-4"
      >
        {}
        <div className="mb-4">
          <Badge variant="secondary" className="mb-2">
            {platformTypeLabels[platform.type] || platform.type}
          </Badge>
          <h1 className="text-xl font-bold text-foreground">{platform.name}</h1>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-medium">{rating}</span>
              <span className="text-muted-foreground">({pluralize(reviewsCount, 'отзыв', 'отзыва', 'отзывов')})</span>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{address}, {city}</span>
          </div>
        </div>

        {}
        <div className="mb-6 rounded-2xl bg-muted/50 p-4">
          <div className="flex items-baseline justify-between">
            <div>
              {price > 0 ? (
                <>
                  <span className="text-2xl font-bold text-foreground">
                    {price.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-muted-foreground"> / сутки</span>
                </>
              ) : (
                <span className="text-2xl font-bold text-foreground">Цена по запросу</span>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Описание</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Характеристики</h2>
          <div className="grid grid-cols-2 gap-3">
            <SpecItem icon={<Ruler className="h-4 w-4" />} label="Размер" value={platform.specs?.size || 'Не указано'} />
            <SpecItem icon={<Eye className="h-4 w-4" />} label="Формат" value={platform.specs?.format || 'Не указано'} />
            <SpecItem
              icon={<Lightbulb className="h-4 w-4" />}
              label="Подсветка"
              value={platform.specs?.illumination ? 'Есть' : 'Нет'}
            />
            <SpecItem icon={<Users className="h-4 w-4" />} label="Трафик" value={platform.specs?.traffic || 'Не указано'} />
          </div>
        </div>

        {}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Отзывы</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">· {pluralize(reviewsCount, 'отзыв', 'отзыва', 'отзывов')}</span>
              </div>
            </div>
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddReview(true)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Написать
              </Button>
            )}
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {reviews.slice(0, showAllReviews ? undefined : 3).map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                          {review.userName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium">{review.userName || 'Аноним'}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-warning/10 px-2 py-1 rounded-full">
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {reviews.length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                >
                  {showAllReviews ? 'Скрыть' : `Показать все ${pluralize(reviews.length, 'отзыв', 'отзыва', 'отзывов')}`}
                  <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showAllReviews ? 'rotate-90' : ''}`} />
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-xl">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Пока нет отзывов</p>
              <p className="text-xs text-muted-foreground">Будьте первым, кто оставит отзыв!</p>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowAddReview(true)}
                >
                  Написать отзыв
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {}
      <Dialog open={showAddReview} onOpenChange={setShowAddReview}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Написать отзыв</DialogTitle>
          </DialogHeader>
          <AddReviewForm
            onSubmit={handleAddReview}
            onCancel={() => setShowAddReview(false)}
          />
        </DialogContent>
      </Dialog>

      {}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 p-4 backdrop-blur-lg safe-area-bottom z-50">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            {price > 0 ? (
              <p className="text-lg font-bold truncate">
                {price.toLocaleString('ru-RU')} ₽
                <span className="text-sm font-normal text-muted-foreground"> / сутки</span>
              </p>
            ) : (
              <p className="text-lg font-bold">Цена по запросу</p>
            )}
          </div>

          {platformId && (
            <div className="flex-1">
              {isAvailable ? (
                <Link to={`/booking/${platformId}`} className="w-full">
                  <Button className="w-full" size="lg">
                    Забронировать
                  </Button>
                </Link>
              ) : (
                <Button className="w-full" size="lg" disabled variant="secondary">
                  Занят
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SpecItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-medium">{value}</p>
      </div>
    </div>
  );
}

function AddReviewForm({
  onSubmit,
  onCancel
}: {
  onSubmit: (rating: number, text: string) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    await onSubmit(rating, text);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4 mt-4">
      {}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Оцените площадку</p>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-warning text-warning'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {rating > 0 && ['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично'][rating]}
        </p>
      </div>

      {}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Ваш отзыв (необязательно)</p>
        <Textarea
          placeholder="Расскажите о вашем опыте..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      {}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Send className="h-4 w-4 mr-1" />
          )}
          Отправить
        </Button>
      </div>
    </div>
  );
}
