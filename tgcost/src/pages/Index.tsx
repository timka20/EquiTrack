import { useState, useEffect, useMemo } from 'react';
import { MapPin, TrendingUp, Loader2, Navigation, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlatformCard } from '@/components/platform/PlatformCard';
import { PlatformFilters, type FilterState } from '@/components/platform/PlatformFilters';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlatformsStore, type Platform } from '@/store/usePlatformsStore';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

type ViewMode = 'all' | 'nearby' | 'popular';

export default function Index() {
  const { isAuthenticated, user } = useAuthStore();
  const { platforms, isLoading, error, fetchPlatforms, fetchPopularPlatforms, fetchNearbyPlatforms } = usePlatformsStore();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: null,
    city: null,
    priceRange: [0, 100000],
  });
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlatforms();
    }
  }, [isAuthenticated, fetchPlatforms]);

  const handleNearbyClick = () => {
    if (!navigator.geolocation) {
      toast.error('Геолокация не поддерживается вашим браузером');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchNearbyPlatforms(latitude, longitude);
        setViewMode('nearby');
        setIsLocating(false);
        toast.success('Показаны площадки рядом с вами');
      },
      (error) => {
        setIsLocating(false);
        toast.error('Не удалось получить ваше местоположение');
        console.error('Geolocation error:', error);
      }
    );
  };

  const handlePopularClick = () => {
    fetchPopularPlatforms();
    setViewMode('popular');
    toast.success('Показаны популярные площадки');
  };

  const handleShowAll = () => {
    fetchPlatforms();
    setViewMode('all');
  };

  const filteredPlatforms = useMemo(() => {
    return platforms.filter((platform) => {
      if (filters.search &&
          !platform.name?.toLowerCase().includes(filters.search.toLowerCase()) &&
          !platform.address?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.type && platform.type !== filters.type) return false;
      if (filters.city && platform.city !== filters.city) return false;
      const price = platform.pricePerDay ?? 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }
      return true;
    });
  }, [platforms, filters]);

  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'nearby': return 'Площадки рядом с вами';
      case 'popular': return 'Популярные площадки';
      default: return 'Все площадки';
    }
  };

  if (!isAuthenticated) {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-screen">
      {}
      <div className="gradient-hero px-4 pb-4 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="text-lg font-semibold text-foreground">
            Привет, {user?.name?.split(' ')[0] || 'пользователь'}! 👋
          </h2>
          <p className="text-sm text-muted-foreground">
            Найдите идеальную площадку для рекламы
          </p>
        </motion.div>

        <PlatformFilters filters={filters} onFiltersChange={setFilters} />

        {}
        <div className="mt-4 flex gap-2">
          <Button
            variant={viewMode === 'nearby' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={handleNearbyClick}
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="mr-2 h-4 w-4" />
            )}
            Рядом со мной
          </Button>
          <Button
            variant={viewMode === 'popular' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={handlePopularClick}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Популярные
          </Button>
        </div>
      </div>

      {}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Загрузка площадок...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-destructive">Ошибка загрузки</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchPlatforms()}>Попробовать снова</Button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {getViewModeTitle()}: {filteredPlatforms.length}
                </span>
                {viewMode !== 'all' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={handleShowAll}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Сбросить
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlatforms.map((platform: Platform, index: number) => (
                <PlatformCard key={platform.id} platform={platform} index={index} />
              ))}
            </div>

            {filteredPlatforms.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg font-medium text-foreground">Ничего не найдено</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {viewMode === 'nearby'
                    ? 'Рядом с вами нет площадок. Попробуйте увеличить радиус поиска.'
                    : 'Попробуйте изменить параметры поиска'}
                </p>
                <Button onClick={handleShowAll}>Показать все площадки</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground font-bold">
            TG
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Добро пожаловать в TGCost
          </h1>
          <p className="text-muted-foreground">
            Платформа для поиска и бронирования офлайн рекламных площадок
          </p>
        </div>

        <div className="mb-8 space-y-3 text-left">
          <FeatureItem icon="📺" text="Билборды, экраны, стены и другие носители" />
          <FeatureItem icon="📍" text="Поиск по карте и геолокации" />
          <FeatureItem icon="📅" text="Удобное бронирование и календарь" />
          <FeatureItem icon="✅" text="Модерация рекламных материалов" />
        </div>

        <div className="space-y-3">
          <Link to="/login" className="block">
            <Button className="w-full" size="lg">
              Войти
            </Button>
          </Link>
          <Link to="/register" className="block">
            <Button variant="outline" className="w-full" size="lg">
              Регистрация
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-foreground">{text}</span>
    </div>
  );
}
