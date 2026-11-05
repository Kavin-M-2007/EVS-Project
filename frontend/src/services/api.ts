import {
  User,
  Municipality,
  SmartBin,
  CollectionTask,
  ClassificationResult,
  RouteOptimizationResult,
  NotificationItem,
  Complaint,
  AuditLog,
  Vehicle,
  Sector
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

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

// Low-level fetch wrapper for FastAPI backend endpoints
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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
  // ==========================================
  // AUTH
  // ==========================================
  login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async (): Promise<User> => {
    return request('/auth/me');
  },

  resetPassword: async (userId: string | number, newPassword: string): Promise<{ message: string }> => {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, new_password: newPassword }),
    });
  },

  // ==========================================
  // MUNICIPALITIES & SECTORS
  // ==========================================
  getMunicipalities: async (): Promise<Municipality[]> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('municipalities')
          .select('*, smart_bins(count), vehicles(count)')
          .order('name');
        if (!error && data && data.length > 0) {
          return data.map((m: any) => ({
            id: m.id,
            name: m.name,
            code: m.code,
            state: m.state,
            country: m.country,
            total_area_sqkm: Number(m.total_area_sqkm) || 150,
            population: m.population || 500000,
            contact_email: m.contact_email,
            contact_phone: m.contact_phone,
            created_at: m.created_at,
            total_bins: m.smart_bins?.[0]?.count || 0,
            active_collectors: 0,
          }));
        }
      } catch (err) {
        console.warn('Supabase getMunicipalities notice:', err);
      }
    }
    return request('/municipalities');
  },

  createMunicipality: async (data: Partial<Municipality>): Promise<Municipality> => {
    if (isSupabaseConfigured) {
      try {
        const { data: created, error } = await supabase
          .from('municipalities')
          .insert([data])
          .select()
          .single();
        if (!error && created) return created;
      } catch (err) {
        console.warn('Supabase createMunicipality notice:', err);
      }
    }
    return request('/municipalities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSectors: async (municipalityId?: string | number): Promise<Sector[]> => {
    if (isSupabaseConfigured && municipalityId) {
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('*')
          .eq('municipality_id', municipalityId)
          .order('name');
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getSectors notice:', err);
      }
    }
    return [];
  },

  // ==========================================
  // USERS & PROFILES
  // ==========================================
  getUsers: async (role?: string, municipalityId?: string | number): Promise<User[]> => {
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('profiles').select('*, municipalities(name)').order('full_name');
        if (role) q = q.eq('role', role);
        if (municipalityId && municipalityId !== 'all') q = q.eq('municipality_id', municipalityId);

        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return data.map((p: any) => ({
            id: p.id,
            email: p.email,
            full_name: p.full_name,
            employee_id: p.employee_id,
            role: p.role,
            municipality_id: p.municipality_id,
            municipality_name: p.municipalities?.name,
            assigned_sector_id: p.assigned_sector_id,
            phone_number: p.phone_number,
            avatar_url: p.avatar_url,
            status: p.status,
            created_at: p.created_at,
            last_login: p.last_login,
          }));
        }
      } catch (err) {
        console.warn('Supabase getUsers notice:', err);
      }
    }
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (municipalityId && municipalityId !== 'all') params.set('municipality_id', municipalityId.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/users${query}`);
  },

  createUser: async (userData: any): Promise<User> => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id: string | number, userData: Partial<User>): Promise<User> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(userData)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase updateUser notice:', err);
      }
    }
    return request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  // ==========================================
  // SMART BINS (Full CRUD + Telemetry)
  // ==========================================
  getBins: async (municipalityId?: string | number, status?: string, category?: string): Promise<SmartBin[]> => {
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('smart_bins').select('*, municipalities(name), sectors(name)').order('fill_level', { ascending: false });
        if (municipalityId && municipalityId !== 'all') q = q.eq('municipality_id', municipalityId);
        if (status && status !== 'all') q = q.eq('status', status);
        if (category && category !== 'all') q = q.eq('waste_category', category);

        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return data.map((b: any) => ({
            id: b.id,
            bin_code: b.bin_code,
            municipality_id: b.municipality_id,
            municipality_name: b.municipalities?.name,
            sector_id: b.sector_id,
            sector_name: b.sectors?.name,
            location_name: b.location_name,
            latitude: b.latitude,
            longitude: b.longitude,
            waste_category: b.waste_category,
            fill_level: Number(b.fill_level) || 0,
            max_capacity_liters: Number(b.max_capacity_liters) || 240,
            status: b.status,
            battery_level: Number(b.battery_level) || 100,
            temperature_c: Number(b.temperature_c) || 25,
            weight_kg: Number(b.weight_kg) || 0,
            last_collection_time: b.last_collection_time,
            last_telemetry_update: b.last_telemetry_update,
            updated_at: b.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getBins notice:', err);
      }
    }
    const params = new URLSearchParams();
    if (municipalityId && municipalityId !== 'all') params.set('municipality_id', municipalityId.toString());
    if (status && status !== 'all') params.set('status_filter', status);
    if (category && category !== 'all') params.set('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/bins${query}`);
  },

  getBinDetails: async (id: string | number): Promise<{ bin: SmartBin; sensor_telemetry_history: any[]; recent_collections: any[] }> => {
    if (isSupabaseConfigured) {
      try {
        const [binResp, telemResp, recResp] = await Promise.all([
          supabase.from('smart_bins').select('*, municipalities(name), sectors(name)').eq('id', id).single(),
          supabase.from('bin_telemetry').select('*').eq('bin_id', id).order('recorded_at', { ascending: false }).limit(12),
          supabase.from('collection_records').select('*').eq('bin_id', id).order('collected_at', { ascending: false }).limit(5)
        ]);

        if (!binResp.error && binResp.data) {
          const b = binResp.data;
          const mappedBin: SmartBin = {
            id: b.id,
            bin_code: b.bin_code,
            municipality_id: b.municipality_id,
            municipality_name: b.municipalities?.name,
            sector_id: b.sector_id,
            sector_name: b.sectors?.name,
            location_name: b.location_name,
            latitude: b.latitude,
            longitude: b.longitude,
            waste_category: b.waste_category,
            fill_level: Number(b.fill_level),
            max_capacity_liters: Number(b.max_capacity_liters),
            status: b.status,
            battery_level: Number(b.battery_level),
            temperature_c: Number(b.temperature_c),
            weight_kg: Number(b.weight_kg),
            last_collection_time: b.last_collection_time,
            last_telemetry_update: b.last_telemetry_update,
            updated_at: b.updated_at,
          };

          return {
            bin: mappedBin,
            sensor_telemetry_history: (telemResp.data || []).reverse().map((t: any) => ({
              fill_percentage: Number(t.fill_percentage),
              temperature_c: Number(t.temperature_c),
              weight_kg: Number(t.weight_kg),
              battery_pct: Number(t.battery_pct),
              recorded_at: new Date(t.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })),
            recent_collections: (recResp.data || []).map((r: any) => ({
              id: r.id,
              weight_kg: Number(r.weight_kg),
              collected_at: new Date(r.collected_at).toLocaleString(),
              status: r.status,
            })),
          };
        }
      } catch (err) {
        console.warn('Supabase getBinDetails notice:', err);
      }
    }
    return request(`/bins/${id}`);
  },

  createBin: async (data: Partial<SmartBin>): Promise<SmartBin> => {
    if (isSupabaseConfigured) {
      try {
        const fill = Number(data.fill_level) || 0;
        const status = fill >= 90 ? 'CRITICAL' : fill >= 70 ? 'NEAR_FULL' : 'NORMAL';
        const { data: created, error } = await supabase
          .from('smart_bins')
          .insert([{
            bin_code: data.bin_code?.toUpperCase(),
            municipality_id: data.municipality_id,
            sector_id: data.sector_id || null,
            location_name: data.location_name,
            latitude: data.latitude,
            longitude: data.longitude,
            waste_category: data.waste_category || 'Mixed Waste',
            fill_level: fill,
            max_capacity_liters: Number(data.max_capacity_liters) || 240,
            status,
            battery_level: Number(data.battery_level) || 100,
            temperature_c: Number(data.temperature_c) || 26.5,
            weight_kg: Number(data.weight_kg) || 0,
          }])
          .select('*, municipalities(name)')
          .single();

        if (!error && created) {
          // Add initial telemetry record
          await supabase.from('bin_telemetry').insert([{
            bin_id: created.id,
            fill_percentage: created.fill_level,
            temperature_c: created.temperature_c,
            weight_kg: created.weight_kg,
            battery_pct: created.battery_level,
          }]);

          return {
            ...created,
            municipality_name: created.municipalities?.name,
          };
        }
      } catch (err) {
        console.warn('Supabase createBin notice:', err);
      }
    }
    return request('/bins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBin: async (id: string | number, data: Partial<SmartBin>): Promise<SmartBin> => {
    if (isSupabaseConfigured) {
      try {
        const updatePayload: any = { ...data };
        if (data.fill_level !== undefined) {
          const fill = Number(data.fill_level);
          updatePayload.status = fill >= 90 ? 'CRITICAL' : fill >= 70 ? 'NEAR_FULL' : 'NORMAL';
        }
        delete updatePayload.municipality_name;
        delete updatePayload.sector_name;

        const { data: updated, error } = await supabase
          .from('smart_bins')
          .update(updatePayload)
          .eq('id', id)
          .select('*, municipalities(name)')
          .single();

        if (!error && updated) {
          return {
            ...updated,
            municipality_name: updated.municipalities?.name,
          };
        }
      } catch (err) {
        console.warn('Supabase updateBin notice:', err);
      }
    }
    return request(`/bins/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteBin: async (id: string | number): Promise<{ message: string }> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('smart_bins').delete().eq('id', id);
        if (!error) return { message: 'Smart bin removed successfully.' };
      } catch (err) {
        console.warn('Supabase deleteBin notice:', err);
      }
    }
    return request(`/bins/${id}`, { method: 'DELETE' });
  },

  updateBinTelemetry: async (id: string | number, telemetry: Partial<SmartBin>): Promise<any> => {
    if (isSupabaseConfigured) {
      try {
        const fill = telemetry.fill_level !== undefined ? Number(telemetry.fill_level) : undefined;
        const status = fill !== undefined ? (fill >= 90 ? 'CRITICAL' : fill >= 70 ? 'NEAR_FULL' : 'NORMAL') : telemetry.status;

        const { data: updated, error } = await supabase
          .from('smart_bins')
          .update({
            ...(fill !== undefined && { fill_level: fill }),
            ...(status && { status }),
            ...(telemetry.battery_level !== undefined && { battery_level: telemetry.battery_level }),
            ...(telemetry.temperature_c !== undefined && { temperature_c: telemetry.temperature_c }),
            ...(telemetry.weight_kg !== undefined && { weight_kg: telemetry.weight_kg }),
            last_telemetry_update: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && updated) {
          // Log telemetry record
          await supabase.from('bin_telemetry').insert([{
            bin_id: id,
            fill_percentage: updated.fill_level,
            temperature_c: updated.temperature_c,
            weight_kg: updated.weight_kg,
            battery_pct: updated.battery_level,
          }]);

          return { message: 'Telemetry updated successfully', status: updated.status, fill_level: updated.fill_level };
        }
      } catch (err) {
        console.warn('Supabase updateBinTelemetry notice:', err);
      }
    }
    return request(`/bins/${id}/telemetry`, {
      method: 'PATCH',
      body: JSON.stringify(telemetry),
    });
  },

  // ==========================================
  // VEHICLES & FLEET
  // ==========================================
  getVehicles: async (municipalityId?: string | number): Promise<Vehicle[]> => {
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('vehicles').select('*, municipalities(name), profiles(full_name)').order('vehicle_code');
        if (municipalityId && municipalityId !== 'all') q = q.eq('municipality_id', municipalityId);
        const { data, error } = await q;
        if (!error && data) {
          return data.map((v: any) => ({
            id: v.id,
            vehicle_code: v.vehicle_code,
            plate_number: v.plate_number,
            municipality_id: v.municipality_id,
            municipality_name: v.municipalities?.name,
            model: v.model,
            capacity_kg: Number(v.capacity_kg),
            current_load_kg: Number(v.current_load_kg),
            status: v.status,
            current_lat: v.current_lat,
            current_lng: v.current_lng,
            assigned_driver_id: v.assigned_driver_id,
            driver_name: v.profiles?.full_name,
            created_at: v.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getVehicles notice:', err);
      }
    }
    return [];
  },

  // ==========================================
  // COLLECTIONS & TASK DISPATCH
  // ==========================================
  getTasks: async (status?: string, priority?: string): Promise<CollectionTask[]> => {
    if (isSupabaseConfigured) {
      try {
        let q = supabase
          .from('collection_assignments')
          .select('*, municipalities(name), collector:collector_id(full_name), vehicle:vehicle_id(plate_number), route:route_id(name)')
          .order('assigned_at', { ascending: false });

        if (status && status !== 'all') q = q.eq('status', status);
        if (priority && priority !== 'all') q = q.eq('priority', priority);

        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return data.map((t: any) => ({
            id: t.id,
            task_code: t.assignment_code,
            municipality_id: t.municipality_id,
            municipality_name: t.municipalities?.name,
            collector_id: t.collector_id,
            collector_name: t.collector?.full_name || 'Unassigned',
            vehicle_id: t.vehicle_id,
            vehicle_plate: t.vehicle?.plate_number || 'None',
            route_id: t.route_id,
            route_name: t.route?.name || 'Custom Route',
            sector_id: t.sector_id,
            area_name: t.area_name,
            priority: t.priority,
            status: t.status,
            assigned_at: t.assigned_at,
            accepted_at: t.accepted_at,
            started_at: t.started_at,
            completed_at: t.completed_at,
            notes: t.notes,
            proof_image_url: t.proof_image_url,
          }));
        }
      } catch (err) {
        console.warn('Supabase getTasks notice:', err);
      }
    }
    const params = new URLSearchParams();
    if (status) params.set('status_filter', status);
    if (priority) params.set('priority', priority);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/collections/tasks${query}`);
  },

  createTask: async (taskData: any): Promise<CollectionTask> => {
    if (isSupabaseConfigured) {
      try {
        const count = Math.floor(Math.random() * 900) + 100;
        const taskCode = `TASK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${count}`;

        const { data: created, error } = await supabase
          .from('collection_assignments')
          .insert([{
            assignment_code: taskCode,
            municipality_id: taskData.municipality_id,
            collector_id: taskData.collector_id,
            vehicle_id: taskData.vehicle_id || null,
            route_id: taskData.route_id || null,
            sector_id: taskData.sector_id || null,
            area_name: taskData.area_name || 'Sector 1',
            priority: taskData.priority || 'MEDIUM',
            status: 'ASSIGNED',
            notes: taskData.notes || '',
          }])
          .select('*, municipalities(name)')
          .single();

        if (!error && created) {
          // Notify collector
          await supabase.from('notifications').insert([{
            user_id: taskData.collector_id,
            municipality_id: taskData.municipality_id,
            title: 'New Task Assignment',
            message: `You have been assigned collection task ${taskCode} in ${taskData.area_name}.`,
            notification_type: 'TASK_ASSIGNED',
          }]);

          return {
            id: created.id,
            task_code: created.assignment_code,
            municipality_id: created.municipality_id,
            municipality_name: created.municipalities?.name,
            collector_id: created.collector_id,
            area_name: created.area_name,
            priority: created.priority,
            status: created.status,
            assigned_at: created.assigned_at,
            notes: created.notes,
          };
        }
      } catch (err) {
        console.warn('Supabase createTask notice:', err);
      }
    }
    return request('/collections/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  updateTaskStatus: async (
    taskId: string | number,
    status: string,
    notes?: string,
    proofImageUrl?: string,
    binsCollected?: (string | number)[]
  ): Promise<any> => {
    if (isSupabaseConfigured) {
      try {
        const now = new Date().toISOString();
        const updatePayload: any = { status };
        if (status === 'Accepted' || status === 'ACCEPTED') updatePayload.accepted_at = now;
        if (status === 'In Progress' || status === 'IN_PROGRESS') updatePayload.started_at = now;
        if (status === 'Collected' || status === 'Completed' || status === 'COLLECTED' || status === 'COMPLETED') {
          updatePayload.completed_at = now;
          if (proofImageUrl) updatePayload.proof_image_url = proofImageUrl;
        }
        if (notes) updatePayload.notes = notes;

        const { data: updatedTask, error } = await supabase
          .from('collection_assignments')
          .update(updatePayload)
          .eq('id', taskId)
          .select()
          .single();

        if (!error && updatedTask) {
          // If bins were collected, reset fill level to 0.0, update telemetry, and record collection
          if (binsCollected && binsCollected.length > 0) {
            for (const bId of binsCollected) {
              const { data: binObj } = await supabase.from('smart_bins').select('*').eq('id', bId).single();
              if (binObj) {
                // Record collection in history
                await supabase.from('collection_records').insert([{
                  assignment_id: taskId,
                  bin_id: bId,
                  collector_id: updatedTask.collector_id,
                  weight_kg: Number(binObj.weight_kg) || 22.5,
                  fill_level_before: Number(binObj.fill_level) || 85.0,
                  collected_at: now,
                  proof_image_url: proofImageUrl || null,
                  status: 'COLLECTED',
                }]);

                // Reset bin fill percentage to 0.0 and status to NORMAL
                await supabase.from('smart_bins').update({
                  fill_level: 0.0,
                  status: 'NORMAL',
                  weight_kg: 0.0,
                  last_collection_time: now,
                  last_telemetry_update: now,
                }).eq('id', bId);

                // Append empty telemetry reading
                await supabase.from('bin_telemetry').insert([{
                  bin_id: bId,
                  fill_percentage: 0.0,
                  temperature_c: binObj.temperature_c,
                  weight_kg: 0.0,
                  battery_pct: binObj.battery_level,
                  recorded_at: now,
                }]);
              }
            }
          }

          return { message: `Task status updated to ${status}`, status };
        }
      } catch (err) {
        console.warn('Supabase updateTaskStatus notice:', err);
      }
    }
    return request(`/collections/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        notes,
        proof_image_url: proofImageUrl,
        bins_collected: binsCollected,
      }),
    });
  },

  getCollectorSummary: async (): Promise<any> => {
    return request('/collections/collector/summary');
  },

  // ==========================================
  // ROUTE OPTIMIZATION (2-Opt TSP via FastAPI)
  // ==========================================
  getRoutes: async (): Promise<any[]> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('route_assignments')
          .select('*, route_stops(*)');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getRoutes notice:', err);
      }
    }
    return request('/routes');
  },

  optimizeRoute: async (data: {
    municipality_id: string | number;
    bin_ids: (string | number)[];
    vehicle_id?: string | number;
    collector_id?: string | number;
    start_lat?: number;
    start_lng?: number;
  }): Promise<RouteOptimizationResult> => {
    return request('/routes/optimize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==========================================
  // AI WASTE CLASSIFICATION (FastAPI Engine)
  // ==========================================
  classifyImage: async (file: File, municipalityId?: string | number): Promise<ClassificationResult> => {
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
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('waste_classifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getClassificationHistory notice:', err);
      }
    }
    return request('/classify/history');
  },

  // ==========================================
  // ANALYTICS & PREDICTIONS
  // ==========================================
  getAnalyticsOverview: async (municipalityId?: string | number): Promise<any> => {
    const query = municipalityId && municipalityId !== 'all' ? `?municipality_id=${municipalityId}` : '';
    return request(`/analytics/overview${query}`);
  },

  getPredictions: async (municipalityId?: string | number): Promise<any> => {
    const query = municipalityId && municipalityId !== 'all' ? `?municipality_id=${municipalityId}` : '';
    return request(`/predictions${query}`);
  },

  // ==========================================
  // CITIZEN COMPLAINTS (Grievance Portal)
  // ==========================================
  submitComplaint: async (data: any): Promise<Complaint> => {
    if (isSupabaseConfigured) {
      try {
        const ticket = `ECO-TKT-${Math.floor(1000 + Math.random() * 9000)}`;
        const { data: created, error } = await supabase
          .from('complaints')
          .insert([{
            ticket_number: ticket,
            citizen_name: data.citizen_name?.trim(),
            citizen_phone: data.citizen_phone || null,
            citizen_email: data.citizen_email || null,
            municipality_id: data.municipality_id || 'a0000000-0000-0000-0000-000000000001',
            sector_id: data.sector_id || null,
            complaint_type: data.complaint_type,
            description: data.description?.trim(),
            location_name: data.location_name?.trim(),
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            photo_url: data.photo_url || null,
            status: 'SUBMITTED',
          }])
          .select('*, municipalities(name)')
          .single();

        if (!error && created) {
          // Post notification to admins
          await supabase.from('notifications').insert([{
            role_target: 'ADMIN',
            municipality_id: created.municipality_id,
            title: `New Grievance: ${created.complaint_type}`,
            message: `Ticket ${ticket} logged at ${created.location_name}.`,
            notification_type: 'DAMAGE_REPORT',
          }]);

          return {
            ...created,
            municipality_name: created.municipalities?.name,
          };
        }
      } catch (err) {
        console.warn('Supabase submitComplaint notice:', err);
      }
    }
    return request('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  trackComplaint: async (ticketNumber: string): Promise<any> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*, municipalities(name)')
          .eq('ticket_number', ticketNumber.trim().toUpperCase())
          .single();

        if (!error && data) {
          return {
            ticket_number: data.ticket_number,
            complaint_type: data.complaint_type,
            location_name: data.location_name,
            status: data.status,
            created_at: new Date(data.created_at).toLocaleString(),
            resolved_at: data.resolved_at ? new Date(data.resolved_at).toLocaleString() : null,
            municipality_name: data.municipalities?.name || 'Coimbatore Municipal Corporation (CCMC)',
          };
        }
      } catch (err) {
        console.warn('Supabase trackComplaint notice:', err);
      }
    }
    return request(`/complaints/track/${ticketNumber}`);
  },

  getComplaints: async (status?: string): Promise<Complaint[]> => {
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('complaints').select('*, municipalities(name)').order('created_at', { ascending: false });
        if (status && status !== 'all') q = q.eq('status', status);
        const { data, error } = await q;
        if (!error && data) {
          return data.map((c: any) => ({
            ...c,
            municipality_name: c.municipalities?.name,
          }));
        }
      } catch (err) {
        console.warn('Supabase getComplaints notice:', err);
      }
    }
    const query = status && status !== 'all' ? `?status_filter=${status}` : '';
    return request(`/complaints${query}`);
  },

  updateComplaintStatus: async (complaintId: string | number, status: string): Promise<any> => {
    if (isSupabaseConfigured) {
      try {
        const updatePayload: any = { status };
        if (status === 'RESOLVED' || status === 'Resolved') {
          updatePayload.resolved_at = new Date().toISOString();
        }
        const { data, error } = await supabase
          .from('complaints')
          .update(updatePayload)
          .eq('id', complaintId)
          .select()
          .single();
        if (!error && data) return { message: `Complaint ${data.ticket_number} marked as ${status}.` };
      } catch (err) {
        console.warn('Supabase updateComplaintStatus notice:', err);
      }
    }
    return request(`/complaints/${complaintId}/status?status=${status}`, {
      method: 'PATCH',
    });
  },

  // ==========================================
  // REPORTS GENERATION & CSV EXPORT
  // ==========================================
  generateReport: async (reportType: string, municipalityId?: string | number): Promise<any> => {
    const query = `?report_type=${reportType}${municipalityId && municipalityId !== 'all' ? `&municipality_id=${municipalityId}` : ''}`;
    return request(`/reports/generate${query}`);
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  getNotifications: async (): Promise<NotificationItem[]> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getNotifications notice:', err);
      }
    }
    return request('/notifications');
  },

  markNotificationRead: async (id: string | number): Promise<any> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('id', id);
        if (!error) return { message: 'Marked read' };
      } catch (err) {
        console.warn('Supabase markNotificationRead notice:', err);
      }
    }
    return request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllNotificationsRead: async (): Promise<any> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('is_read', false);
        if (!error) return { message: 'All notifications marked as read' };
      } catch (err) {
        console.warn('Supabase markAllNotificationsRead notice:', err);
      }
    }
    return request('/notifications/read-all', {
      method: 'POST',
    });
  },

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  getAuditLogs: async (action?: string, limit: number = 50): Promise<AuditLog[]> => {
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
        if (action) q = q.eq('action', action);
        const { data, error } = await q;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getAuditLogs notice:', err);
      }
    }
    const params = new URLSearchParams({ limit: limit.toString() });
    if (action) params.set('action', action);
    return request(`/audit-logs?${params.toString()}`);
  },

  // ==========================================
  // SUPABASE STORAGE (Image / Proof Uploads)
  // ==========================================
  uploadFile: async (file: File, bucket: 'collection-proof' | 'complaint-photos' | 'waste-classification-images' | 'avatars'): Promise<string> => {
    if (isSupabaseConfigured) {
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        return publicUrlData.publicUrl;
      }
    }

    // Fallback to uploading to backend static server
    const formData = new FormData();
    formData.append('file', file);
    const resp = await request<{ url?: string; image_url?: string }>('/upload', {
      method: 'POST',
      body: formData,
    }).catch(() => ({ url: URL.createObjectURL(file), image_url: undefined }));
    return resp.url || resp.image_url || URL.createObjectURL(file);
  },

  // ==========================================
  // SUPABASE REALTIME SUBSCRIPTIONS
  // ==========================================
  subscribeToBins: (onUpdate: (payload: any) => void) => {
    if (!isSupabaseConfigured) return () => {};
    const channel = supabase
      .channel('realtime_smart_bins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'smart_bins' }, onUpdate)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToTasks: (onUpdate: (payload: any) => void) => {
    if (!isSupabaseConfigured) return () => {};
    const channel = supabase
      .channel('realtime_collection_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collection_assignments' }, onUpdate)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToComplaints: (onUpdate: (payload: any) => void) => {
    if (!isSupabaseConfigured) return () => {};
    const channel = supabase
      .channel('realtime_complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, onUpdate)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToNotifications: (onUpdate: (payload: any) => void) => {
    if (!isSupabaseConfigured) return () => {};
    const channel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, onUpdate)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },
};
