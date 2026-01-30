-- =============================================================================
-- Lean Tripartite Logistics Management System - Database Schema
-- Run this file FIRST to establish the database structure
-- =============================================================================

-- 1. Create ENUM Types
-- -----------------------------------------------------------------------------
CREATE TYPE app_role AS ENUM ('admin', 'client', 'driver');
CREATE TYPE trip_status AS ENUM ('pending', 'assigned', 'active', 'completed', 'cancelled');
CREATE TYPE milestone_type AS ENUM ('pickup', 'break', 'fuel', 'toll', 'drop');


-- 2. Profiles Table (Linked to Supabase Auth)
-- -----------------------------------------------------------------------------
-- Stores user profile information linked to auth.users
-- Roles: admin (manages system), client (requests trips), driver (executes trips)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  phone text UNIQUE NOT NULL,
  role app_role DEFAULT 'client'::app_role NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase Auth with role-based access';
COMMENT ON COLUMN public.profiles.role IS 'User role: admin, client, or driver';


-- 3. Vehicles Table
-- -----------------------------------------------------------------------------
-- Stores fleet vehicle information with availability tracking
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number text UNIQUE NOT NULL,
  vehicle_type text NOT NULL,
  capacity_kg numeric NOT NULL CHECK (capacity_kg > 0),
  is_available boolean DEFAULT true NOT NULL,
  admin_id uuid REFERENCES public.profiles(id) NOT NULL, -- Tracks which admin added the vehicle
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Index for availability queries
CREATE INDEX idx_vehicles_is_available ON public.vehicles(is_available);
CREATE INDEX idx_vehicles_admin_id ON public.vehicles(admin_id);

COMMENT ON TABLE public.vehicles IS 'Fleet vehicles with registration, capacity, and availability tracking';
COMMENT ON COLUMN public.vehicles.is_available IS 'Automatically toggled by trip status triggers';


-- 4. Trips Table
-- -----------------------------------------------------------------------------
-- Core logistics tracking table linking clients, drivers, and vehicles
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.profiles(id) NOT NULL,
  driver_id uuid REFERENCES public.profiles(id),
  vehicle_id uuid REFERENCES public.vehicles(id),
  status trip_status DEFAULT 'pending'::trip_status NOT NULL,
  billed_amount numeric DEFAULT 0 NOT NULL CHECK (billed_amount >= 0),
  amount_received numeric DEFAULT 0 NOT NULL CHECK (amount_received >= 0),
  pickup_location text,
  drop_location text,
  notes text, -- Additional trip notes/instructions
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Ensure driver and vehicle are assigned before trip becomes active
  CONSTRAINT chk_assigned_before_active CHECK (
    status NOT IN ('assigned', 'active') OR (driver_id IS NOT NULL AND vehicle_id IS NOT NULL)
  )
);

-- Indexes for common query patterns
CREATE INDEX idx_trips_client_id ON public.trips(client_id);
CREATE INDEX idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX idx_trips_vehicle_id ON public.trips(vehicle_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trips_created_at ON public.trips(created_at DESC);

COMMENT ON TABLE public.trips IS 'Trip records linking clients, drivers, and vehicles with financial tracking';
COMMENT ON COLUMN public.trips.status IS 'Trip lifecycle: pending → assigned → active → completed/cancelled';


-- 5. Milestones Table
-- -----------------------------------------------------------------------------
-- Manual trip event logging by drivers with timestamp and cost metadata
CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  type milestone_type NOT NULL,
  location_name text, -- Manual entry by driver (e.g., "Terminal A", "Rest Stop 1")
  recorded_at timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL, -- Flexible: {fuel_cost: 50, liters: 20}, {toll_amount: 15}
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index for trip-based lookups
CREATE INDEX idx_milestones_trip_id ON public.milestones(trip_id);
CREATE INDEX idx_milestones_type ON public.milestones(type);
CREATE INDEX idx_milestones_recorded_at ON public.milestones(recorded_at DESC);

COMMENT ON TABLE public.milestones IS 'Trip event log for tracking pickup, breaks, fuel, tolls, and drops';
COMMENT ON COLUMN public.milestones.metadata IS 'JSONB for flexible cost data: fuel_cost, toll_amount, liters, etc.';
