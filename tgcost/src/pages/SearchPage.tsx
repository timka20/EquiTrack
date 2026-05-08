import { useState, useMemo, useEffect, useRef } from 'react';
import { MapPin, List, Map, Loader2, Navigation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlatformCard } from '@/components/platform/PlatformCard';
import { PlatformFilters, type FilterState } from '@/components/platform/PlatformFilters';
import { usePlatformsStore } from '@/store/usePlatformsStore';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: null,
    city: null,
    priceRange: [0, 100000],
  });
  const [isLocating, setIsLocating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const yandexMapRef = useRef<any>(null);
  const [ymapsLoaded, setYmapsLoaded] = useState(false);

  const { platforms, isLoading, error, fetchPlatforms, fetchNearbyPlatforms } = usePlatformsStore();

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  useEffect(() => {
    if (viewMode === 'map' && !window.ymaps && !ymapsLoaded) {
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.com/2.1/?apikey=ваш_api_ключ&lang=ru_RU';
      script.onload = () => {
        window.ymaps.ready(() => {
          setYmapsLoaded(true);
        });
      };
      script.onerror = () => {
        toast.error('Не удалось загрузить карту');
      };
      document.head.appendChild(script);
    }
  }, [viewMode, ymapsLoaded]);

  useEffect(() => {
    if (viewMode === 'map' && ymapsLoaded && mapRef.current && !yandexMapRef.current) {
      const map = new window.ymaps.Map(mapRef.current, {
        center: [55.76, 37.64],
        zoom: 10,
        controls: ['zoomControl', 'searchControl'],
      });
      yandexMapRef.current = map;

      updateMapMarkers(map);
    }
  }, [viewMode, ymapsLoaded, platforms]);

  const updateMapMarkers = (map: any) => {
    map.geoObjects.removeAll();

    platforms.forEach((platform) => {
      if (platform.latitude && platform.longitude) {
        const placemark = new window.ymaps.Placemark(
          [platform.latitude, platform.longitude],
          {
            balloonContent: `
              <div style="padding: 10px; max-width: 250px;">
                <img src="${platform.image}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
                <h3 style="font-weight: bold; margin-bottom: 4px;">${platform.name}</h3>
                <p style="color: #666; font-size: 12px; margin-bottom: 4px;">${platform.address}</p>
                <p style="font-weight: bold; color: #3b82f6;">${platform.pricePerDay?.toLocaleString()} ₽/день</p>
              </div>
            `,
            hintContent: platform.name,
          },
          {
            preset: 'islands#blueAdvertisingIcon',
          }
        );

        placemark.events.add('click', () => {
          setSelectedPlatform(platform);
        });

        map.geoObjects.add(placemark);
      }
    });

    if (map.geoObjects.getLength() > 0) {
      map.setBounds(map.geoObjects.getBounds(), { checkZoomRange: true });
    }
  };

  useEffect(() => {
    if (yandexMapRef.current && viewMode === 'map') {
      updateMapMarkers(yandexMapRef.current);
    }
  }, [platforms, viewMode]);

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

        if (yandexMapRef.current) {
          yandexMapRef.current.setCenter([latitude, longitude], 12);

          const userPlacemark = new window.ymaps.Placemark(
            [latitude, longitude],
            { hintContent: 'Вы здесь' },
            { preset: 'islands#redCircleIcon' }
          );
          yandexMapRef.current.geoObjects.add(userPlacemark);
        }

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

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Поиск</h1>
          <div className="flex rounded-lg bg-muted p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="h-8 px-3"
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <PlatformFilters filters={filters} onFiltersChange={setFilters} />

        {}
        <Button
          variant="outline"
          className="mt-4 w-full"
          size="sm"
          onClick={handleNearbyClick}
          disabled={isLocating}
        >
          {isLocating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="mr-2 h-4 w-4" />
          )}
          Показать рядом со мной
        </Button>

        {}
        <div className="mt-4">
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
              <p className="mb-3 text-sm text-muted-foreground">
                Найдено: {filteredPlatforms.length}
              </p>

              {viewMode === 'list' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredPlatforms.map((platform, index) => (
                    <PlatformCard key={platform.id} platform={platform} index={index} />
                  ))}
                </div>
              ) : (
                <div
                  ref={mapRef}
                  className="aspect-[4/3] rounded-2xl bg-muted overflow-hidden"
                  style={{ minHeight: '400px' }}
                >
                  {!ymapsLoaded && (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              )}

              {filteredPlatforms.length === 0 && (
                <div className="flex flex-col items-center py-16 text-center">
                  <p className="text-lg font-medium">Ничего не найдено</p>
                  <p className="text-sm text-muted-foreground">
                    Попробуйте изменить параметры поиска
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {}
      <Dialog open={!!selectedPlatform} onOpenChange={() => setSelectedPlatform(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{selectedPlatform?.name}</DialogTitle>
          </DialogHeader>
          {selectedPlatform && (
            <div className="space-y-4">
              <img
                src={selectedPlatform.image}
                alt={selectedPlatform.name}
                className="w-full h-40 object-cover rounded-lg"
              />
              <p className="text-sm text-muted-foreground">{selectedPlatform.address}</p>
              <p className="text-lg font-bold text-primary">
                {selectedPlatform.pricePerDay?.toLocaleString()} ₽/день
              </p>
              <Button
                className="w-full"
                onClick={() => window.location.href = `/platform/${selectedPlatform.id}`}
              >
                Подробнее
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

declare global {
  interface Window {
    ymaps: any;
  }
}
