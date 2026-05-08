export type UserRole = 'advertiser' | 'owner' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'blocked';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  company?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type PlatformType = 'billboard' | 'digital_screen' | 'wall' | 'mall' | 'transport';
export type PlatformStatus = 'active' | 'pending' | 'rejected';

export interface Platform {
  id: string;
  name: string;
  type: PlatformType;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  pricePerDay: number;
  rating: number;
  reviewsCount: number;
  image?: string;
  images: string;
  description?: string;
  size?: string;
  format?: string;
  illumination?: boolean;
  traffic?: string;
  available: boolean;
  ownerId?: string;
  status: PlatformStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type MaterialStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface Booking {
  id: string;
  platformId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  materialStatus: MaterialStatus;
  materialUrl?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  platformId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}
