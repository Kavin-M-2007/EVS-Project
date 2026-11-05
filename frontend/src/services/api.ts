import {
  User,
  Municipality,
  SmartBin,
  CollectionTask,
  ClassificationResult,
  RouteOptimizationResult,
  NotificationItem,
  Complaint,
  AuditLog
} from '../types';

const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('ecosort_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('ecosort_token', token);
}

export function clearStoredToken() {
  localStorage.removeItem('ecosort_token');
  localStorage.removeItem('ecosort_user');
}

export function getStoredUser(): User | null {
  const u = localStorage.getItem('ecosort_user');
  if (!u) return null;
  try {
    return JSON.parse(u);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User) {
  localStorage.setItem('ecosort_user', JSON.stringify(user));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async (): Promise<User> => {
    return request('/auth/me');
  },

  resetPassword: async (userId: number, newPassword: string): Promise<{ message: string }> => {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, new_password: newPassword }),
    });
  },

  // Municipalities
  getMunicipalities: async (): Promise<Municipality[]> => {
    return request('/municipalities');
  },

  createMunicipality: async (data: Partial<Municipality>): Promise<Municipality> => {
    return request('/municipalities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Users
  getUsers: async (role?: string, municipalityId?: number): Promise<User[]> => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (municipalityId) params.set('municipality_id', municipalityId.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/users${query}`);
  },

  createUser: async (data: any): Promise<User> => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    return request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Smart Bins
  getBins: async (municipalityId?: number, status?: string, category?: string): Promise<SmartBin[]> => {
    const params = new URLSearchParams();
    if (municipalityId) params.set('municipality_id', municipalityId.toString());
    if (status) params.set('status_filter', status);
    if (category) params.set('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/bins${query}`);
  },

  getBinDetails: async (id: number): Promise<{ bin: SmartBin; sensor_telemetry_history: any[]; recent_collections: any[] }> => {
    return request(`/bins/${id}`);
  },

  createBin: async (data: Partial<SmartBin>): Promise<SmartBin> => {
    return request('/bins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBinTelemetry: async (id: number, telemetry: Partial<SmartBin>): Promise<any> => {
    return request(`/bins/${id}/telemetry`, {
      method: 'PATCH',
      body: JSON.stringify(telemetry),
    });
  },

  // Collections & Tasks
  getTasks: async (status?: string, priority?: string): Promise<CollectionTask[]> => {
    const params = new URLSearchParams();
    if (status) params.set('status_filter', status);
    if (priority) params.set('priority', priority);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/collections/tasks${query}`);
  },

  createTask: async (data: any): Promise<CollectionTask> => {
    return request('/collections/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTaskStatus: async (taskId: number, status: string, notes?: string, proofImageUrl?: string, binsCollected?: number[]): Promise<any> => {
    return request(`/collections/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        notes,
        proof_image_url: proofImageUrl,
        bins_collected: binsCollected
      }),
    });
  },

  getCollectorSummary: async (): Promise<any> => {
    return request('/collections/collector/summary');
  },

  // Route Optimization
  getRoutes: async (): Promise<any[]> => {
    return request('/routes');
  },

  optimizeRoute: async (data: {
    municipality_id: number;
    bin_ids: number[];
    vehicle_id?: number;
    collector_id?: number;
    start_lat?: number;
    start_lng?: number;
  }): Promise<RouteOptimizationResult> => {
    return request('/routes/optimize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // AI Classification
  classifyImage: async (file: File, municipalityId?: number): Promise<ClassificationResult> => {
    const formData = new FormData();
    formData.append('file', file);
    if (municipalityId) {
      formData.append('municipality_id', municipalityId.toString());
    }
    return request('/classify', {
      method: 'POST',
      body: formData,
    });
  },

  getClassificationHistory: async (): Promise<ClassificationResult[]> => {
    return request('/classify/history');
  },

  // Analytics
  getAnalyticsOverview: async (municipalityId?: number): Promise<any> => {
    const query = municipalityId ? `?municipality_id=${municipalityId}` : '';
    return request(`/analytics/overview${query}`);
  },

  // Predictions
  getPredictions: async (municipalityId?: number): Promise<any> => {
    const query = municipalityId ? `?municipality_id=${municipalityId}` : '';
    return request(`/predictions${query}`);
  },

  // Complaints
  submitComplaint: async (data: any): Promise<Complaint> => {
    return request('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  trackComplaint: async (ticketNumber: string): Promise<any> => {
    return request(`/complaints/track/${ticketNumber}`);
  },

  getComplaints: async (status?: string): Promise<Complaint[]> => {
    const query = status ? `?status_filter=${status}` : '';
    return request(`/complaints${query}`);
  },

  updateComplaintStatus: async (complaintId: number, status: string): Promise<any> => {
    return request(`/complaints/${complaintId}/status?status=${status}`, {
      method: 'PATCH',
    });
  },

  // Reports
  generateReport: async (reportType: string, municipalityId?: number): Promise<any> => {
    const query = `?report_type=${reportType}${municipalityId ? `&municipality_id=${municipalityId}` : ''}`;
    return request(`/reports/generate${query}`);
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    return request('/notifications');
  },

  markNotificationRead: async (id: number): Promise<any> => {
    return request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllNotificationsRead: async (): Promise<any> => {
    return request('/notifications/read-all', {
      method: 'POST',
    });
  },

  // Audit Logs
  getAuditLogs: async (action?: string, limit: number = 50): Promise<AuditLog[]> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (action) params.set('action', action);
    return request(`/audit-logs?${params.toString()}`);
  },
};

