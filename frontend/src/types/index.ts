export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'GARBAGE_COLLECTOR' | 'MUNICIPALITY_MONITOR';

export interface User {
  id: string | number;
  email: string;
  full_name: string;
  employee_id: string;
  role: UserRole;
  municipality_id?: string | number | null;
  municipality_name?: string;
  assigned_sector_id?: string | number | null;
  assigned_area?: string | null;
  phone_number?: string | null;
  avatar_url?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  last_login?: string | null;
}

export interface Municipality {
  id: string | number;
  name: string;
  code: string;
  state: string;
  country: string;
  total_area_sqkm: number;
  population: number;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  total_bins?: number;
  active_collectors?: number;
}

export interface Sector {
  id: string | number;
  municipality_id: string | number;
  name: string;
  code: string;
  description?: string;
  created_at?: string;
}

export type BinStatus = 'NORMAL' | 'NEAR_FULL' | 'CRITICAL' | 'OFFLINE';

export interface SmartBin {
  id: string | number;
  bin_code: string;
  municipality_id: string | number;
  municipality_name?: string;
  sector_id?: string | number | null;
  sector_name?: string;
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
  last_telemetry_update?: string;
  updated_at: string;
}

export interface Vehicle {
  id: string | number;
  vehicle_code: string;
  plate_number: string;
  municipality_id: string | number;
  municipality_name?: string;
  model: string;
  capacity_kg: number;
  current_load_kg: number;
  status: 'ACTIVE' | 'IN_MAINTENANCE' | 'IDLE' | 'DECOMMISSIONED';
  current_lat?: number | null;
  current_lng?: number | null;
  assigned_driver_id?: string | number | null;
  driver_name?: string;
  created_at?: string;
}

export type TaskStatus = 'Assigned' | 'Accepted' | 'In Progress' | 'Collected' | 'Completed' | 'ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COLLECTED' | 'COMPLETED';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW' | 'URGENT';

export interface CollectionTask {
  id: string | number;
  task_code: string;
  municipality_id: string | number;
  municipality_name?: string;
  collector_id: string | number;
  collector_name?: string;
  vehicle_id?: string | number;
  vehicle_plate?: string;
  route_id?: string | number;
  route_name?: string;
  sector_id?: string | number | null;
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

export interface CollectionRecord {
  id: string | number;
  assignment_id: string | number;
  bin_id: string | number;
  collector_id: string | number;
  weight_kg: number;
  fill_level_before: number;
  collected_at: string;
  proof_image_url?: string;
  status: 'COLLECTED' | 'VERIFIED' | 'FLAGGED';
}

export interface ClassificationResult {
  id?: string | number;
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
  bin_id: string | number;
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
  id: string | number;
  title: string;
  message: string;
  notification_type: 'OVERFLOW_ALERT' | 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'SYSTEM_ALERT' | 'DAMAGE_REPORT' | 'INFO';
  is_read: boolean;
  created_at: string;
  role_target?: string;
  municipality_id?: string | number;
}

export interface Complaint {
  id: string | number;
  ticket_number: string;
  citizen_name: string;
  citizen_phone?: string;
  citizen_email?: string;
  municipality_id: string | number;
  municipality_name?: string;
  complaint_type: string;
  description: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED' | 'PENDING' | 'IN_PROGRESS' | 'REJECTED';
  created_at: string;
  resolved_at?: string | null;
}

export interface AuditLog {
  id: string | number;
  user_id?: string | number;
  user_email?: string;
  user_role?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface WastePrediction {
  id: string | number;
  municipality_id: string | number;
  prediction_date: string;
  predicted_waste_kg: number;
  recycling_rate_pct: number;
  high_waste_zones: any[];
  overflow_risk_bins: any[];
  recommendations: any[];
  is_model_forecast: boolean;
}

export interface SystemSetting {
  id: string | number;
  key: string;
  value: string;
  category: string;
  description?: string;
  updated_at?: string;
}
