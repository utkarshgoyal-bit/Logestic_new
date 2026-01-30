-- =============================================================================
-- Lean Tripartite Logistics Management System - Row Level Security Policies
-- Run this file SECOND after schema.sql
-- =============================================================================

-- Enable RLS on all tables
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- Helper Functions (SECURITY DEFINER for performance)
-- =============================================================================

-- Get the current user's role from profiles
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is driver
CREATE OR REPLACE FUNCTION public.is_driver()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'driver'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- =============================================================================
-- 1. PROFILES POLICIES
-- =============================================================================

-- Admins: Full access to all profiles
CREATE POLICY "admin_full_access_profiles" 
ON public.profiles FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- All users: Can read their own profile
CREATE POLICY "users_read_own_profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (id = auth.uid());

-- All users: Can update their own profile (except role)
CREATE POLICY "users_update_own_profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Drivers: Can view client profiles for their assigned trips
CREATE POLICY "drivers_view_assigned_clients" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
  public.is_driver() AND 
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.client_id = profiles.id 
    AND trips.driver_id = auth.uid()
  )
);


-- =============================================================================
-- 2. VEHICLES POLICIES
-- =============================================================================

-- Admins: Full access to all vehicles
CREATE POLICY "admin_full_access_vehicles" 
ON public.vehicles FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Clients: Can view available vehicles (for trip requests)
CREATE POLICY "clients_view_available_vehicles" 
ON public.vehicles FOR SELECT 
TO authenticated 
USING (is_available = true);

-- Drivers: Can view vehicles assigned to their trips
CREATE POLICY "drivers_view_assigned_vehicles" 
ON public.vehicles FOR SELECT 
TO authenticated 
USING (
  public.is_driver() AND 
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.vehicle_id = vehicles.id 
    AND trips.driver_id = auth.uid()
    AND trips.status IN ('assigned', 'active')
  )
);


-- =============================================================================
-- 3. TRIPS POLICIES
-- =============================================================================

-- Admins: Full access to all trips
CREATE POLICY "admin_full_access_trips" 
ON public.trips FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Clients: Can view their own trips
CREATE POLICY "clients_view_own_trips" 
ON public.trips FOR SELECT 
TO authenticated 
USING (client_id = auth.uid());

-- Clients: Can create trips (as pending)
CREATE POLICY "clients_create_trips" 
ON public.trips FOR INSERT 
TO authenticated 
WITH CHECK (
  client_id = auth.uid() AND 
  status = 'pending'
);

-- Clients: Can cancel their own pending trips
CREATE POLICY "clients_cancel_pending_trips" 
ON public.trips FOR UPDATE 
TO authenticated 
USING (
  client_id = auth.uid() AND 
  status = 'pending'
)
WITH CHECK (
  client_id = auth.uid() AND 
  status = 'cancelled'
);

-- Drivers: Can view their assigned trips
CREATE POLICY "drivers_view_assigned_trips" 
ON public.trips FOR SELECT 
TO authenticated 
USING (driver_id = auth.uid());

-- Drivers: Can update status of their assigned trips (assigned → active → completed)
CREATE POLICY "drivers_update_trip_status" 
ON public.trips FOR UPDATE 
TO authenticated 
USING (
  driver_id = auth.uid() AND 
  status IN ('assigned', 'active')
)
WITH CHECK (
  driver_id = auth.uid() AND 
  status IN ('active', 'completed')
);


-- =============================================================================
-- 4. MILESTONES POLICIES
-- =============================================================================

-- Admins: Full access to all milestones
CREATE POLICY "admin_full_access_milestones" 
ON public.milestones FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Clients: Can view milestones for their trips
CREATE POLICY "clients_view_trip_milestones" 
ON public.milestones FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = milestones.trip_id 
    AND trips.client_id = auth.uid()
  )
);

-- Drivers: Full CRUD on milestones for their assigned active trips
CREATE POLICY "drivers_manage_trip_milestones" 
ON public.milestones FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = milestones.trip_id 
    AND trips.driver_id = auth.uid()
    AND trips.status IN ('assigned', 'active')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = milestones.trip_id 
    AND trips.driver_id = auth.uid()
    AND trips.status IN ('assigned', 'active')
  )
);
