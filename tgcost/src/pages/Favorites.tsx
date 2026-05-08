import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlatformCard } from '@/components/platform/PlatformCard';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import type { Platform } from '@/store/usePlatformsStore';

export default function Favorites() {
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, fetchFavorites, isLoading } = useFavoritesStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const filteredFavorites = useMemo(() => {
    if (!searchQuery) return favorites;
    return favorites.filter((p: Platform) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [favorites, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Избранное</h1>
          {favorites.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Очистить
            </Button>
          )}
        </div>

        {}
        {favorites.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск в избранном..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : (
          <>
            {}
            {filteredFavorites.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredFavorites.map((platform: Platform, index: number) => (
                  <PlatformCard key={platform.id} platform={platform} index={index} />
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-16 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Heart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="mb-1 font-medium">Нет избранных площадок</h2>
                <p className="text-sm text-muted-foreground">
                  Добавляйте площадки в избранное, нажимая ❤️
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-16 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="mb-1 font-medium">Ничего не найдено</h2>
                <p className="text-sm text-muted-foreground">
                  Попробуйте изменить поисковый запрос
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
