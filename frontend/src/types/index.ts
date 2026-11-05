export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'GARBAGE_COLLECTOR' | 'MUNICIPALITY_MONITOR';

export interface User {
  id: number;
  email: string;
  full_name: string;
  employee_id: string;
  role: UserRole;
  municipality_id?: number | null;
  municipality_name?: string;
  assigned_area?: string | null;
  phone_number?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  last_login?: string | null;
}

export interface Municipality {
  id: number;
  name: string;
  code: string;
  state: string;
  country: string;
  total_area_sqkm: number;
  population: number;
  contact_email?: string;
  created_at: string;
  total_bins?: number;
  active_collectors?: number;
}

export type BinStatus = 'NORMAL' | 'NEAR_FULL' | 'CRITICAL' | 'OFFLINE';

export interface SmartBin {
  id: number;
  bin_code: string;
  municipality_id: number;
  municipality_name?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  waste_category: string;
  fill_level: number;
  max_capacity_liters: number;
  status: BinStatus;
  battery_level: number;
  temperature_c: number;
  weight_kg: number;
  last_collection_time?: string | null;
  updated_at: string;
}

export type TaskStatus = 'Assigned' | 'Accepted' | 'In Progress' | 'Collected' | 'Completed';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CollectionTask {
  id: number;
  task_code: string;
  municipality_id: number;
  municipality_name?: string;
  collector_id: number;
  collector_name?: string;
  vehicle_id?: number;
  vehicle_plate?: string;
  route_id?: number;
  route_name?: string;
  area_name: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_at: string;
  accepted_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  proof_image_url?: string | null;
}

export interface ClassificationResult {
  id?: number;
  binary_category: 'Biodegradable' | 'Non-Biodegradable';
  broad_category: string;
  fine_class: string;
  confidence_score: number;
  disposal_guide: string;
  recycling_guide: string;
  model_mode: string;
  image_url?: string;
  created_at?: string;
}

export interface RouteWaypoint {
  order: number;
  bin_id: number;
  bin_code: string;
  location_name: string;
  latitude: number;
  longitude: number;
  fill_level: number;
  waste_category: string;
}

export interface RouteOptimizationResult {
  route_code: string;
  total_bins: number;
  estimated_distance_km: number;
  estimated_time_minutes: number;
  waypoints: RouteWaypoint[];
  standard_distance_km: number;
  distance_saved_km: number;
  time_saved_minutes: number;
  algorithm_used: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: 'OVERFLOW_ALERT' | 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'SYSTEM_ALERT' | 'DAMAGE_REPORT' | 'INFO';
  is_read: boolean;
  created_at: string;
  role_target?: string;
}

export interface Complaint {
  id: number;
  ticket_number: string;
  citizen_name: string;
  citizen_phone?: string;
  citizen_email?: string;
  municipality_id: number;
  municipality_name?: string;
  complaint_type: string;
  description: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  created_at: string;
  resolved_at?: string | null;
}

export interface AuditLog {
  id: number;
  user_email?: string;
  user_role?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}
