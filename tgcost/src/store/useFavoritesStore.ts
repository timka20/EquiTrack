import { create } from 'zustand';
import { api } from '@/services/api';

interface Platform {
  id: string;
  name: string;
  type: string;
  address?: string;
  city?: string;
  pricePerDay?: number;
  rating?: number;
  reviewsCount?: number;
  image?: string;
  images?: string[];
  description?: string;
  specs?: {
    size?: string;
    format?: string;
    illumination?: boolean;
    traffic?: string;
  };
  available?: boolean;
  bookedDates?: string[];
}

interface FavoritesState {
  favorites: Platform[];
  isLoading: boolean;
  error: string | null;

  fetchFavorites: () => Promise<void>;
  toggleFavorite: (platformId: string) => Promise<boolean>;
  isFavorite: (platformId: string) => boolean;
  clearError: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const favorites = await api.getFavorites();
      set({ favorites, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  toggleFavorite: async (platformId: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.toggleFavorite(platformId);

      const favorites = await api.getFavorites();
      set({ favorites, isLoading: false });

      return result.isFavorite;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  isFavorite: (platformId: string) => {
    return get().favorites.some(f => f.id === platformId);
  },

  clearError: () => set({ error: null }),
}));
