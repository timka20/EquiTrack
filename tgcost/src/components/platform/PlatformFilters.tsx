import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import type { PlatformType } from '@/data/platforms';
import { platformTypeLabels, platformTypeIcons, cities } from '@/data/platforms';

interface FilterState {
  search: string;
  type: PlatformType | null;
  city: string | null;
  priceRange: [number, number];
}

interface PlatformFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function PlatformFilters({ filters, onFiltersChange }: PlatformFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const types: PlatformType[] = ['billboard', 'digital_screen', 'wall', 'mall', 'transport'];

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: null,
      city: null,
      priceRange: [0, 100000],
    });
  };

  const hasActiveFilters = filters.type || filters.city || filters.priceRange[0] > 0 || filters.priceRange[1] < 100000;

  return (
    <div className="space-y-3">
      {}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск площадок..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="relative shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </Button>
      </div>

      {}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Badge
          variant={filters.type === null ? 'default' : 'outline'}
          className="cursor-pointer whitespace-nowrap px-3 py-1.5"
          onClick={() => updateFilter('type', null)}
        >
          Все
        </Badge>
        {types.map((type) => (
          <Badge
            key={type}
            variant={filters.type === type ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap px-3 py-1.5"
            onClick={() => updateFilter('type', type)}
          >
            {platformTypeIcons[type]} {platformTypeLabels[type]}
          </Badge>
        ))}
      </div>

      {}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
              {}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Город
                </label>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <Badge
                      key={city}
                      variant={filters.city === city ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => updateFilter('city', filters.city === city ? null : city)}
                    >
                      {city}
                    </Badge>
                  ))}
                </div>
              </div>

              {}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Цена за сутки: {(filters.priceRange?.[0] ?? 0).toLocaleString('ru-RU')} - {(filters.priceRange?.[1] ?? 100000).toLocaleString('ru-RU')} ₽
                </label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                  min={0}
                  max={100000}
                  step={1000}
                  className="mt-4"
                />
              </div>

              {}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Сбросить фильтры
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export type { FilterState };
