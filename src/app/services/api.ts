const API_URL = 'http://localhost:49375/api';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const authApi = {
  login: (email: string, password: string) => 
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: any) => 
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string) =>
    fetchApi('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  me: () => fetchApi('/auth/me'),

  updateProfile: (data: any) => 
    fetchApi('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const horsesApi = {
  getAll: (filters?: { status?: string; forSale?: boolean; ownerId?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.forSale) params.append('forSale', 'true');
    if (filters?.ownerId) params.append('ownerId', filters.ownerId.toString());
    return fetchApi(`/horses?${params.toString()}`);
  },

  getById: (id: number | string) => fetchApi(`/horses/${id}`),

  getStats: () => fetchApi('/horses/stats'),

  getForSale: () => fetchApi('/horses/for-sale'),

  getMyHorses: () => fetchApi('/my-horses'),

  getPedigree: (id: number | string) => fetchApi(`/horses/${id}/pedigree`),

  create: (data: any) => 
    fetchApi('/horses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number | string, data: any) => 
    fetchApi(`/horses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number | string) => 
    fetchApi(`/horses/${id}`, {
      method: 'DELETE',
    }),
};

export const racesApi = {
  getAll: () => fetchApi('/races'),

  getById: (id: number | string) => fetchApi(`/races/${id}`),

  getStats: () => fetchApi('/races/stats'),

  getCalendar: () => fetchApi('/races/calendar'),

  register: (raceId: number | string, data?: any) => 
    fetchApi(`/races/${raceId}/register`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  create: (data: any) => 
    fetchApi('/races', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number | string, data: any) => 
    fetchApi(`/races/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  addResults: (raceId: number | string, results: any[]) => 
    fetchApi(`/races/${raceId}/results`, {
      method: 'POST',
      body: JSON.stringify({ results }),
    }),
};

export const breedingsApi = {
  getAll: () => fetchApi('/breedings'),

  getStats: () => fetchApi('/breedings/stats'),

  getById: (id: number | string) => fetchApi(`/breedings/${id}`),

  getFoals: () => fetchApi('/foals'),

  predictPrice: (horseId: number | string) => 
    fetchApi(`/horses/${horseId}/price-prediction`),

  create: (data: any) => 
    fetchApi('/breedings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number | string, data: any) => 
    fetchApi(`/breedings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  addFoal: (breedingId: number | string, data: any) => 
    fetchApi(`/breedings/${breedingId}/foals`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const trainingsApi = {
  getAll: () => fetchApi('/trainings'),

  getByHorseId: (horseId: number | string) => 
    fetchApi(`/horses/${horseId}/training-stats`),

  create: (data: any) => 
    fetchApi('/trainings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number | string, data: any) => 
    fetchApi(`/trainings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number | string) => 
    fetchApi(`/trainings/${id}`, {
      method: 'DELETE',
    }),
};

export const jockeyReportsApi = {
  getAll: () => fetchApi('/jockey-reports'),

  create: (data: any) =>
    fetchApi('/jockey-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const medicalApi = {
  getByHorseId: (horseId: number | string) => 
    fetchApi(`/horses/${horseId}/medical-records`),

  getVaccinations: (horseId: number | string) => 
    fetchApi(`/horses/${horseId}/vaccinations`),

  getUpcomingVaccinations: () => fetchApi('/upcoming-vaccinations'),

  createRecord: (horseId: number | string, data: any) => 
    fetchApi(`/horses/${horseId}/medical-records`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createVaccination: (horseId: number | string, data: any) => 
    fetchApi(`/horses/${horseId}/vaccinations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const usersApi = {
  getAll: () => fetchApi('/users'),

  getById: (id: number | string) => fetchApi(`/users/${id}`),

  getStats: () => fetchApi('/users/stats'),

  getTrainers: () => fetchApi('/users/trainers'),

  getJockeys: () => fetchApi('/users/jockeys'),

  getVeterinarians: () => fetchApi('/users/veterinarians'),

  create: (data: any) => 
    fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number | string, data: any) => 
    fetchApi(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number | string) => 
    fetchApi(`/users/${id}`, {
      method: 'DELETE',
    }),
};

export const adminApi = {
  getStats: () => fetchApi('/admin/stats'),

  getAllUsers: () => fetchApi('/users'),

  updateUser: (id: number | string, data: any) => 
    fetchApi(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateUserPassword: (id: number | string, password: string) => 
    fetchApi(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    }),

  getPendingApplications: () => fetchApi('/race-registrations/pending'),

  approveApplication: (id: number | string) => 
    fetchApi(`/race-registrations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  rejectApplication: (id: number | string) => 
    fetchApi(`/race-registrations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  updateRace: (id: number | string, data: any) => 
    fetchApi(`/races/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const messagesApi = {
  getInbox: () => fetchApi('/messages/inbox'),

  getSent: () => fetchApi('/messages/sent'),

  getById: (id: number | string) => fetchApi(`/messages/${id}`),

  getUnreadCount: () => fetchApi('/messages/unread-count'),

  create: (data: any) => 
    fetchApi('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: number | string) => 
    fetchApi(`/messages/${id}`, {
      method: 'DELETE',
    }),
};

export const notificationsApi = {
  getAll: () => fetchApi('/notifications'),

  getUnreadCount: () => fetchApi('/notifications/unread-count'),

  markAsRead: (id: number | string) => 
    fetchApi(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () => 
    fetchApi('/notifications/read-all', {
      method: 'PUT',
    }),

  delete: (id: number | string) => 
    fetchApi(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};

export const analyticsApi = {
  getDashboard: () => fetchApi('/analytics/dashboard'),

  getOwner: () => fetchApi('/analytics/owner'),

  getTrainer: () => fetchApi('/analytics/trainer'),

  getJockey: () => fetchApi('/analytics/jockey'),

  getAdmin: () => fetchApi('/analytics/admin'),

  getMy: () => fetchApi('/analytics/me'),
};

export const statsApi = {
  getMain: () => fetchApi('/horses/stats'),
};

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  avatarUrl?: string;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export const api = {
  getToken,
  setToken,

  async login(email: string, password: string) {
    const response = await authApi.login(email, password);
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  async register(data: any) {
    const response = await authApi.register(data);
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  async getMe() {
    return authApi.me();
  },

  async updateProfile(data: Partial<User>) {
    return authApi.updateProfile(data);
  },
};

export default {
  auth: authApi,
  horses: horsesApi,
  races: racesApi,
  breedings: breedingsApi,
  trainings: trainingsApi,
  medical: medicalApi,
  users: usersApi,
  admin: adminApi,
  messages: messagesApi,
  notifications: notificationsApi,
  analytics: analyticsApi,
  stats: statsApi,
  api,
  getToken,
  setToken,
};
