import { create } from 'zustand';
import { api } from '@/services/api';
import type { User, UserRole } from './useAuthStore';

export type PlatformStatus = 'active' | 'pending' | 'rejected';

export interface PendingPlatform {
  id: string;
  name: string;
  address: string;
  city: string;
  ownerId: string;
  ownerName: string;
  submittedAt: string;
  image: string;
  description: string;
  specs: {
    size: string;
    format: string;
    illumination: boolean;
    traffic: string;
  };
  pricePerDay: number;
  status: PlatformStatus;
}

export interface AdminPlatform {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  pricePerDay: number;
  rating: number;
  image: string;
  status: PlatformStatus;
  available: boolean;
  ownerId: string;
}

export interface PendingMaterial {
  id: string;
  bookingId: string;
  platformId: string;
  platformName: string;
  advertiserId: string;
  advertiserName: string;
  materialUrl: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface PendingBooking {
  id: string;
  platformId: string;
  platformName: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  materialStatus: string;
  createdAt: string;
}

interface AdminState {
  stats: {
    usersCount: number;
    platformsCount: number;
    pendingModerationCount: number;
    bookingsCount: number;
    pendingPlatforms: number;
    pendingMaterials: number;
  };
  users: User[];
  pendingPlatforms: PendingPlatform[];
  pendingMaterials: PendingMaterial[];
  pendingBookings: PendingBooking[];
  allPlatforms: AdminPlatform[];
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchPendingPlatforms: () => Promise<void>;
  fetchPendingMaterials: () => Promise<void>;
  fetchPendingBookings: () => Promise<void>;
  fetchAllPlatforms: () => Promise<void>;

  approvePlatform: (platformId: string) => Promise<boolean>;
  rejectPlatform: (platformId: string) => Promise<boolean>;
  approveMaterial: (materialId: string) => Promise<boolean>;
  rejectMaterial: (materialId: string, reason: string) => Promise<boolean>;
  approveBooking: (bookingId: string) => Promise<boolean>;
  rejectBooking: (bookingId: string) => Promise<boolean>;
  blockUser: (userId: string) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  changeUserRole: (userId: string, role: UserRole) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  deletePlatform: (platformId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: {
    usersCount: 0,
    platformsCount: 0,
    pendingModerationCount: 0,
    bookingsCount: 0,
    pendingPlatforms: 0,
    pendingMaterials: 0,
  },
  users: [],
  pendingPlatforms: [],
  pendingMaterials: [],
  pendingBookings: [],
  allPlatforms: [],
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const stats = await api.getAdminStats();
      set({ stats, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const users = await api.getAdminUsers();
      set({ users, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPendingPlatforms: async () => {
    set({ isLoading: true });
    try {
      const platforms = await api.getPendingPlatforms();
      const formatted: PendingPlatform[] = platforms.map((p: any) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        city: p.city,
        ownerId: p.owner_id,
        ownerName: p.ownerName || 'Unknown',
        submittedAt: p.created_at,
        image: p.image,
        description: p.description,
        specs: {
          size: p.size,
          format: p.format,
          illumination: p.illumination,
          traffic: p.traffic,
        },
        pricePerDay: p.price_per_day,
        status: p.status,
      }));
      set({ pendingPlatforms: formatted, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPendingMaterials: async () => {
    set({ isLoading: true });
    try {
      const materials = await api.getPendingMaterials();
      const formatted: PendingMaterial[] = materials.map((m: any) => ({
        id: m.id,
        bookingId: m.id,
        platformId: m.platformId,
        platformName: m.platformName,
        advertiserId: m.userId,
        advertiserName: m.userName,
        materialUrl: m.materialUrl,
        submittedAt: m.createdAt,
        status: m.materialStatus,
        rejectionReason: m.rejectionReason,
      }));
      set({ pendingMaterials: formatted, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPendingBookings: async () => {
    set({ isLoading: true });
    try {
      const bookings = await api.getPendingBookings();
      const formatted: PendingBooking[] = bookings.map((b: any) => ({
        id: b.id,
        platformId: b.platformId,
        platformName: b.platformName,
        userId: b.userId,
        userName: b.userName,
        startDate: b.startDate,
        endDate: b.endDate,
        totalPrice: b.totalPrice,
        status: b.status,
        materialStatus: b.materialStatus,
        createdAt: b.createdAt,
      }));
      set({ pendingBookings: formatted, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchAllPlatforms: async () => {
    set({ isLoading: true });
    try {
      const platforms = await api.getAllPlatforms();
      const formatted: AdminPlatform[] = platforms.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        address: p.address,
        city: p.city,
        pricePerDay: p.price_per_day,
        rating: p.rating,
        image: p.image,
        status: p.status,
        available: p.available,
        ownerId: p.owner_id,
      }));
      set({ allPlatforms: formatted, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  approvePlatform: async (platformId: string) => {
    set({ isLoading: true });
    try {
      await api.approvePlatform(platformId);
      set((state) => ({
        pendingPlatforms: state.pendingPlatforms.filter(p => p.id !== platformId),
        allPlatforms: state.allPlatforms.map(p =>
          p.id === platformId ? { ...p, status: 'active' as const } : p
        ),
        stats: {
          ...state.stats,
          platformsCount: state.stats.platformsCount + 1,
          pendingModerationCount: Math.max(0, state.stats.pendingModerationCount - 1),
          pendingPlatforms: Math.max(0, state.stats.pendingPlatforms - 1),
        },
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  rejectPlatform: async (platformId: string) => {
    set({ isLoading: true });
    try {
      await api.rejectPlatform(platformId);
      set((state) => ({
        pendingPlatforms: state.pendingPlatforms.filter(p => p.id !== platformId),
        allPlatforms: state.allPlatforms.map(p =>
          p.id === platformId ? { ...p, status: 'rejected' as const } : p
        ),
        stats: {
          ...state.stats,
          pendingModerationCount: Math.max(0, state.stats.pendingModerationCount - 1),
          pendingPlatforms: Math.max(0, state.stats.pendingPlatforms - 1),
        },
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  approveMaterial: async (materialId: string) => {
    set({ isLoading: true });
    try {
      await api.approveMaterial(materialId);
      set((state) => ({
        pendingMaterials: state.pendingMaterials.filter(m => m.id !== materialId),
        stats: {
          ...state.stats,
          pendingModerationCount: Math.max(0, state.stats.pendingModerationCount - 1),
          pendingMaterials: Math.max(0, state.stats.pendingMaterials - 1),
        },
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  rejectMaterial: async (materialId: string, reason: string) => {
    set({ isLoading: true });
    try {
      await api.rejectMaterial(materialId, reason);
      set((state) => ({
        pendingMaterials: state.pendingMaterials.filter(m => m.id !== materialId),
        stats: {
          ...state.stats,
          pendingModerationCount: Math.max(0, state.stats.pendingModerationCount - 1),
          pendingMaterials: Math.max(0, state.stats.pendingMaterials - 1),
        },
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  approveBooking: async (bookingId: string) => {
    set({ isLoading: true });
    try {
      await api.updateBookingStatus(bookingId, 'confirmed');
      set((state) => ({
        pendingBookings: state.pendingBookings.filter(b => b.id !== bookingId),
        stats: {
          ...state.stats,
          pendingModerationCount: Math.max(0, state.stats.pendingModerationCount - 1),
        },
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  rejectBooking: async (bookingId: string) => {
    set({ isLoading: true });
    try {
      await api.cancelBooking(bookingId);
      set((state) => ({
        pendingBookings: state.pendingBookings.filter(b => b.id !== bookingId),
        stats: {
          ...state.stats,
          pendingModerationCount: Math.max(0, state.stats.pendingModerationCount - 1),
        },
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  blockUser: async (userId: string) => {
    set({ isLoading: true });
    try {
      await api.blockUser(userId);
      set((state) => ({
        users: state.users.map(u =>
          u.id === userId ? { ...u, status: 'blocked' as const } : u
        ),
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  unblockUser: async (userId: string) => {
    set({ isLoading: true });
    try {
      await api.unblockUser(userId);
      set((state) => ({
        users: state.users.map(u =>
          u.id === userId ? { ...u, status: 'active' as const } : u
        ),
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  changeUserRole: async (userId: string, role: UserRole) => {
    set({ isLoading: true });
    try {
      await api.updateUser(userId, { role });
      set((state) => ({
        users: state.users.map(u =>
          u.id === userId ? { ...u, role } : u
        ),
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  deleteUser: async (userId: string) => {
    set({ isLoading: true });
    try {
      await api.deleteUser(userId);
      set((state) => ({
        users: state.users.filter(u => u.id !== userId),
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  deletePlatform: async (platformId: string) => {
    set({ isLoading: true });
    try {
      await api.adminDeletePlatform(platformId);
      set((state) => ({
        allPlatforms: state.allPlatforms.filter(p => p.id !== platformId),
        stats: {
          ...state.stats,
          platformsCount: Math.max(0, state.stats.platformsCount - 1),
        },
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
