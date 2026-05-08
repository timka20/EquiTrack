export enum UserRole {
  GUEST = 'guest',
  OWNER_PRIVATE = 'owner_private',
  OWNER_STUD = 'owner_stud',
  TRAINER = 'trainer',
  JOCKEY = 'jockey',
  VETERINARIAN = 'veterinarian',
  ADMIN = 'admin'
}

export enum HorseStatus {
  IN_TRAINING = 'in_training',
  RESTING = 'resting',
  BREEDING = 'breeding',
  FOR_SALE = 'for_sale',
  SOLD = 'sold',
  RETIRED = 'retired'
}

export enum HorseGender {
  STALLION = 'stallion',
  MARE = 'mare',
  GELDING = 'gelding'
}

export enum RaceStatus {
  SCHEDULED = 'scheduled',
  REGISTRATION_OPEN = 'registration_open',
  REGISTRATION_CLOSED = 'registration_closed',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  CANCELLED = 'cancelled'
}

export enum RegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum BreedingStatus {
  PLANNED = 'planned',
  COMPLETED = 'completed',
  PREGNANCY_CONFIRMED = 'pregnancy_confirmed',
  NOT_CONFIRMED = 'not_confirmed'
}

export enum FoalStatus {
  AT_STUD = 'at_stud',
  FOR_SALE = 'for_sale',
  RESERVED = 'reserved',
  SOLD = 'sold'
}

export enum VaccinationType {
  ROUTINE = 'routine',
  REQUIRED = 'required',
  OPTIONAL = 'optional'
}

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Horse {
  id: number;
  name: string;
  gender: HorseGender;
  color: string;
  birthYear: number;
  birthCountry: string;
  breederId?: number;
  ownerId?: number;
  trainerId?: number;
  jockeyId?: number;
  fatherId?: number;
  motherId?: number;
  status: HorseStatus;
  photos: string[];
  description?: string;
  price?: number;
  totalEarnings?: number;
  wins?: number;
  podiums?: number;
  totalRaces?: number;
  places?: number;
  starts?: number;
  ownerName?: string;
  breederName?: string;
  trainerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Race {
  id: number;
  name: string;
  date: Date;
  hippodrome: string;
  distance: number;
  surface?: string;
  prizeFund: number;
  category?: string;
  status: RaceStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceRegistration {
  id: number;
  raceId: number;
  horseId: number;
  ownerId: number;
  trainerId?: number;
  jockeyId?: number;
  status: RegistrationStatus;
  createdAt: Date;
}

export interface RaceResult {
  id: number;
  raceId: number;
  horseId: number;
  position: number;
  time?: string;
  prize?: number;
  notes?: string;
  createdAt: Date;
}

export interface Breeding {
  id: number;
  mareId: number;
  stallionId: number;
  plannedDate: Date;
  actualDate?: Date;
  status: BreedingStatus;
  expectedFoalingDate?: Date;
  notes?: string;
  createdAt: Date;
}

export interface Foal {
  id: number;
  breedingId: number;
  horseId: number;
  status: FoalStatus;
  price?: number;
  reservationDate?: Date;
  buyerId?: number;
  notes?: string;
  createdAt: Date;
}

export interface MedicalRecord {
  id: number;
  horseId: number;
  veterinarianId: number;
  date: string | Date;
  record_type: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  restrictions?: string;
  status?: string;
  createdAt: Date;
}

export interface Vaccination {
  id: number;
  horseId: number;
  name: string;
  date: Date;
  nextDate?: Date;
  veterinarianId: number;
  notes?: string;
  createdAt: Date;
}

export interface Training {
  id: number;
  horseId: number;
  trainerId: number;
  date: Date;
  type: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  horseCondition: string;
  notes?: string;
  createdAt: Date;
}

export interface JockeyReport {
  id: number;
  raceId: number;
  horseId: number;
  jockeyId: number;
  startBehavior: string;
  distanceBehavior: string;
  finishBehavior: string;
  horseCondition: string;
  equipmentNotes?: string;
  recommendations?: string;
  createdAt: Date;
}

export interface JwtUserPayload {
  id: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ActivityLog {
  id: number;
  userId?: number;
  action: string;
  entityType: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}
