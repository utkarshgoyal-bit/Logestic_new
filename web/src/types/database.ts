// Database types generated from Supabase schema
// These match the schema defined in supabase/schema.sql

export type AppRole = 'admin' | 'client' | 'driver';
export type TripStatus = 'pending' | 'assigned' | 'active' | 'completed' | 'cancelled';
export type MilestoneType = 'pickup' | 'break' | 'fuel' | 'toll' | 'drop';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: AppRole;
  is_active: boolean;
  is_available: boolean;
  age?: number;
  license_number?: string;
  remarks?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  registration_number: string;
  vehicle_type: string;
  capacity_kg: number;
  is_available: boolean;
  model?: string;
  year?: number;
  insurance_number?: string;
  insurance_expiry?: string;
  admin_id: string;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  client_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  status: TripStatus;
  billed_amount: number;
  amount_received: number;
  pickup_location: string | null;
  drop_location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  client?: Profile;
  driver?: Profile;
  vehicle?: Vehicle;
}

export interface MilestoneMetadata {
  fuel_cost?: number;
  liters?: number;
  toll_amount?: number;
  duration_mins?: number;
  notes?: string;
  action?: string;
  timestamp?: string;
}

export interface Milestone {
  id: string;
  trip_id: string;
  type: MilestoneType;
  location_name: string | null;
  recorded_at: string;
  metadata: MilestoneMetadata;
  created_at: string;
}
