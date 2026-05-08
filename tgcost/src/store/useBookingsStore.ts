import { create } from 'zustand';
import { api } from '@/services/api';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type MaterialStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface Booking {
  id: string;
  platformId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice?: number;
  status: BookingStatus;
  materialStatus: MaterialStatus;
  materialUrl?: string;
  rejectionReason?: string;
  createdAt: string;
  platformName?: string;
  platformImage?: string;
  platformAddress?: string;
  platformCity?: string;
  platformPrice?: number;
}

interface BookingsState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;

  fetchBookings: () => Promise<void>;
  addBooking: (data: { platformId: string; startDate: string; endDate: string; totalPrice: number }) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<boolean>;
  updateMaterialStatus: (bookingId: string, materialStatus: MaterialStatus, rejectionReason?: string) => Promise<boolean>;
  uploadMaterial: (bookingId: string, file: File) => Promise<boolean>;
  approveMaterial: (bookingId: string) => Promise<boolean>;
  rejectMaterial: (bookingId: string, reason: string) => Promise<boolean>;
  getUserBookings: (userId: string) => Booking[];
  getPlatformBookings: (platformId: string) => Booking[];
  clearError: () => void;
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const bookings = await api.getMyBookings();
      set({ bookings, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addBooking: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await api.createBooking(data);
      set((state) => ({
        bookings: [booking, ...state.bookings],
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  cancelBooking: async (bookingId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.cancelBooking(bookingId);
      set((state) => ({
        bookings: state.bookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: 'cancelled' as const }
            : booking
        ),
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateBookingStatus: async (bookingId: string, status: BookingStatus) => {
    set({ isLoading: true, error: null });
    try {
      await api.updateBookingStatus(bookingId, status);
      set((state) => ({
        bookings: state.bookings.map(booking =>
          booking.id === bookingId ? { ...booking, status } : booking
        ),
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateMaterialStatus: async (bookingId: string, materialStatus: MaterialStatus, rejectionReason?: string) => {
    set({ isLoading: true, error: null });
    try {
      if (materialStatus === 'approved') {
        await api.approveMaterial(bookingId);
      } else if (materialStatus === 'rejected' && rejectionReason) {
        await api.rejectMaterial(bookingId, rejectionReason);
      }

      set((state) => ({
        bookings: state.bookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, materialStatus, rejectionReason }
            : booking
        ),
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  uploadMaterial: async (bookingId: string, file: File) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.uploadMaterial(bookingId, file);
      set((state) => ({
        bookings: state.bookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, materialUrl: result.materialUrl, materialStatus: 'pending' }
            : booking
        ),
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  approveMaterial: async (bookingId: string) => {
    return get().updateMaterialStatus(bookingId, 'approved');
  },

  rejectMaterial: async (bookingId: string, reason: string) => {
    return get().updateMaterialStatus(bookingId, 'rejected', reason);
  },

  getUserBookings: (userId: string) => {
    return get().bookings
      .filter(booking => booking.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getPlatformBookings: (platformId: string) => {
    return get().bookings.filter(booking => booking.platformId === platformId);
  },

  clearError: () => set({ error: null }),
}));
