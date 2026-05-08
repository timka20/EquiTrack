const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:64738/api';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  auth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('tgcost_token');
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.auth !== false) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
      mode: 'cors',
      credentials: 'omit',
    };

    if (options.body && options.method !== 'GET') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {

        localStorage.removeItem('tgcost_token');
        localStorage.removeItem('tgcost-auth');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || error.message || `HTTP ${response.status}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error: any) {

      if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
        console.error('Network error:', error);
        throw new Error('Ошибка соединения с сервером. Проверьте подключение к интернету или CORS настройки сервера.');
      }
      throw error;
    }
  }

  login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
  }

  register(data: { email: string; password: string; name: string; role: string }) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: data,
      auth: false,
    });
  }

  getProfile() {
    return this.request<any>('/auth/profile');
  }

  updateProfile(data: Partial<any>) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: data,
    });
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/profile/password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
    });
  }

  getPlatforms() {
    return this.request<any[]>('/platforms');
  }

  getPopularPlatforms(limit: number = 10) {
    return this.request<any[]>(`/platforms/popular?limit=${limit}`);
  }

  getNearbyPlatforms(lat: number, lng: number, radius: number = 50) {
    return this.request<any[]>(`/platforms/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }

  getPlatform(id: string) {
    return this.request<any>(`/platforms/${id}`);
  }

  searchPlatforms(query: string, city?: string, type?: string) {
    const params = new URLSearchParams({ q: query });
    if (city) params.append('city', city);
    if (type) params.append('type', type);
    return this.request<any[]>(`/platforms/search?${params}`);
  }

  getCities() {
    return this.request<string[]>('/platforms/cities');
  }

  createPlatform(data: any) {
    return this.request<any>('/platforms', {
      method: 'POST',
      body: data,
    });
  }

  updatePlatform(id: string, data: any) {
    return this.request<any>(`/platforms/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  deletePlatform(id: string) {
    return this.request(`/platforms/${id}`, {
      method: 'DELETE',
    });
  }

  getMyPlatforms() {
    return this.request<any[]>('/platforms/my/platforms');
  }

  addReview(platformId: string, data: { rating: number; text?: string }) {
    return this.request(`/platforms/${platformId}/reviews`, {
      method: 'POST',
      body: data,
    });
  }

  getMyBookings() {
    return this.request<any[]>('/bookings/my');
  }

  getPlatformBookings(platformId: string) {
    return this.request<any[]>(`/bookings/platform/${platformId}`);
  }

  createBooking(data: { platformId: string; startDate: string; endDate: string }) {
    return this.request<any>('/bookings', {
      method: 'POST',
      body: data,
    });
  }

  cancelBooking(id: string) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'PUT',
    });
  }

  updateBookingStatus(id: string, status: string) {
    return this.request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  uploadMaterial(bookingId: string, file: File) {
    const formData = new FormData();
    formData.append('material', file);

    return fetch(`${this.baseUrl}/bookings/${bookingId}/material`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: formData,
    }).then(r => r.json());
  }

  approveMaterial(bookingId: string) {
    return this.request(`/bookings/${bookingId}/material/approve`, {
      method: 'PUT',
    });
  }

  rejectMaterial(bookingId: string, reason: string) {
    return this.request(`/bookings/${bookingId}/material/reject`, {
      method: 'PUT',
      body: { reason },
    });
  }

  getFavorites() {
    return this.request<any[]>('/favorites');
  }

  toggleFavorite(platformId: string) {
    return this.request<{ isFavorite: boolean }>(`/favorites/${platformId}`, {
      method: 'POST',
    });
  }

  checkFavorite(platformId: string) {
    return this.request<{ isFavorite: boolean }>(`/favorites/${platformId}/check`);
  }

  getAdminStats() {
    return this.request<any>('/admin/stats');
  }

  getAdminUsers() {
    return this.request<any[]>('/admin/users');
  }

  updateUser(id: string, data: any) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  blockUser(id: string) {
    return this.request(`/admin/users/${id}/block`, {
      method: 'PUT',
    });
  }

  unblockUser(id: string) {
    return this.request(`/admin/users/${id}/unblock`, {
      method: 'PUT',
    });
  }

  deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  getPendingPlatforms() {
    return this.request<any[]>('/admin/pending-platforms');
  }

  approvePlatform(id: string) {
    return this.request(`/admin/platforms/${id}/approve`, {
      method: 'PUT',
    });
  }

  rejectPlatform(id: string) {
    return this.request(`/admin/platforms/${id}/reject`, {
      method: 'PUT',
    });
  }

  getPendingMaterials() {
    return this.request<any[]>('/admin/pending-materials');
  }

  getPendingBookings() {
    return this.request<any[]>('/admin/pending-bookings');
  }

  getAllBookings() {
    return this.request<any[]>('/admin/bookings');
  }

  getAllPlatforms() {
    return this.request<any[]>('/admin/platforms');
  }

  adminDeletePlatform(id: string) {
    return this.request(`/admin/platforms/${id}`, {
      method: 'DELETE',
    });
  }

  adminDeleteBooking(id: string) {
    return this.request(`/admin/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  getNotifications() {
    return this.request<any[]>('/notifications');
  }

  getUnreadNotificationsCount() {
    return this.request<{ count: number }>('/notifications/unread-count');
  }

  markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
