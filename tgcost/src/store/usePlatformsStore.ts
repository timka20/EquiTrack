import { create } from 'zustand';
import { api } from '@/services/api';

export type PlatformType = 'billboard' | 'digital_screen' | 'wall' | 'mall' | 'transport';

export interface Platform {
  id: string;
  name: string;
  type: PlatformType;
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
  ownerId?: string;
  status?: 'active' | 'pending' | 'rejected';
}

export interface Review {
  id: string;
  platformId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
}

interface PlatformsState {
  platforms: Platform[];
  currentPlatform: Platform | null;
  reviews: Review[];
  cities: string[];
  isLoading: boolean;
  error: string | null;

  fetchPlatforms: () => Promise<void>;
  fetchPopularPlatforms: () => Promise<void>;
  fetchNearbyPlatforms: (lat: number, lng: number) => Promise<void>;
  fetchPlatform: (id: string) => Promise<void>;
  searchPlatforms: (query: string, city?: string, type?: string) => Promise<void>;
  fetchCities: () => Promise<void>;
  createPlatform: (data: Partial<Platform>) => Promise<boolean>;
  updatePlatform: (id: string, data: Partial<Platform>) => Promise<boolean>;
  deletePlatform: (id: string) => Promise<boolean>;
  addReview: (platformId: string, data: { rating: number; text?: string }) => Promise<boolean>;
  clearCurrentPlatform: () => void;
  clearError: () => void;
}

export const usePlatformsStore = create<PlatformsState>((set, get) => ({
  platforms: [],
  currentPlatform: null,
  reviews: [],
  cities: [],
  isLoading: false,
  error: null,

  fetchPlatforms: async () => {
    set({ isLoading: true, error: null });
    try {
      const platforms = await api.getPlatforms();
      set({ platforms, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPopularPlatforms: async () => {
    set({ isLoading: true, error: null });
    try {
      const platforms = await api.getPopularPlatforms(10);
      set({ platforms, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchNearbyPlatforms: async (lat: number, lng: number) => {
    set({ isLoading: true, error: null });
    try {
      const platforms = await api.getNearbyPlatforms(lat, lng, 50);
      set({ platforms, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPlatform: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const platform = await api.getPlatform(id);
      set({
        currentPlatform: platform,
        reviews: platform.reviews || [],
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  searchPlatforms: async (query: string, city?: string, type?: string) => {
    set({ isLoading: true, error: null });
    try {
      const platforms = await api.searchPlatforms(query, city, type);
      set({ platforms, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchCities: async () => {
    try {
      const cities = await api.getCities();
      set({ cities });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createPlatform: async (data: Partial<Platform>) => {
    set({ isLoading: true, error: null });
    try {
      await api.createPlatform(data);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updatePlatform: async (id: string, data: Partial<Platform>) => {
    set({ isLoading: true, error: null });
    try {
      await api.updatePlatform(id, data);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  deletePlatform: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.deletePlatform(id);
      set((state) => ({
        platforms: state.platforms.filter(p => p.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  addReview: async (platformId: string, data: { rating: number; text?: string }) => {
    set({ error: null });
    try {
      await api.addReview(platformId, data);

      const platform = await api.getPlatform(platformId);
      set({
        currentPlatform: platform,
        reviews: platform.reviews || []
      });
      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  clearCurrentPlatform: () => set({ currentPlatform: null, reviews: [] }),
  clearError: () => set({ error: null }),
}));
