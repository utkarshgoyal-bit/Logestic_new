-- =============================================================================
-- Lean Tripartite Logistics Management System - Database Triggers
-- Run this file THIRD after rls_policies.sql
-- =============================================================================


-- =============================================================================
-- 1. UPDATED_AT TRIGGER (Auto-update timestamp on row modification)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles table
CREATE TRIGGER tr_profiles_update_timestamp 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Apply to vehicles table
CREATE TRIGGER tr_vehicles_update_timestamp 
BEFORE UPDATE ON public.vehicles 
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Apply to trips table
CREATE TRIGGER tr_trips_update_timestamp 
BEFORE UPDATE ON public.trips 
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


-- =============================================================================
-- 2. VEHICLE AVAILABILITY TRIGGER (Auto-toggle when trip status changes)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_vehicle_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- When trip becomes ASSIGNED or ACTIVE: Mark vehicle as unavailable
  -- This prevents double-booking while a vehicle is reserved for an upcoming trip
  IF NEW.status IN ('assigned', 'active') AND (OLD.status IS NULL OR OLD.status NOT IN ('assigned', 'active')) THEN
    UPDATE public.vehicles 
    SET is_available = false 
    WHERE id = NEW.vehicle_id;
  
  -- When trip is COMPLETED or CANCELLED: Mark vehicle as available
  ELSIF NEW.status IN ('completed', 'cancelled') AND OLD.status NOT IN ('completed', 'cancelled') THEN
    UPDATE public.vehicles 
    SET is_available = true 
    WHERE id = NEW.vehicle_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on INSERT (in case trip is created directly as active)
CREATE TRIGGER tr_trips_vehicle_availability_insert
AFTER INSERT ON public.trips
FOR EACH ROW
WHEN (NEW.vehicle_id IS NOT NULL)
EXECUTE FUNCTION public.handle_vehicle_availability();

-- Trigger on UPDATE of status column
CREATE TRIGGER tr_trips_vehicle_availability_update
AFTER UPDATE OF status ON public.trips
FOR EACH ROW
WHEN (NEW.vehicle_id IS NOT NULL)
EXECUTE FUNCTION public.handle_vehicle_availability();


-- =============================================================================
-- 3. NEW USER PROFILE TRIGGER (Auto-create profile on auth.users insert)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'client'::app_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to auth.users table
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- 4. VALIDATE TRIP ASSIGNMENTS TRIGGER (Ensure driver/vehicle roles are correct)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.validate_trip_assignments()
RETURNS TRIGGER AS $$
DECLARE
  client_role app_role;
  driver_role app_role;
BEGIN
  -- Validate client is actually a client
  SELECT role INTO client_role FROM public.profiles WHERE id = NEW.client_id;
  IF client_role IS NULL OR client_role <> 'client' THEN
    RAISE EXCEPTION 'client_id must reference a user with client role';
  END IF;
  
  -- Validate driver (if assigned) is actually a driver
  IF NEW.driver_id IS NOT NULL THEN
    SELECT role INTO driver_role FROM public.profiles WHERE id = NEW.driver_id;
    IF driver_role IS NULL OR driver_role <> 'driver' THEN
      RAISE EXCEPTION 'driver_id must reference a user with driver role';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_trips_validate_assignments
BEFORE INSERT OR UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION public.validate_trip_assignments();


-- =============================================================================
-- 5. MILESTONE VALIDATION TRIGGER (Ensure trip is active for milestones)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.validate_milestone_trip()
RETURNS TRIGGER AS $$
DECLARE
  trip_status trip_status;
BEGIN
  SELECT status INTO trip_status FROM public.trips WHERE id = NEW.trip_id;
  
  IF trip_status IS NULL THEN
    RAISE EXCEPTION 'Trip not found';
  END IF;
  
  IF trip_status NOT IN ('assigned', 'active') THEN
    RAISE EXCEPTION 'Cannot add milestones to trips that are not assigned or active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_milestones_validate_trip
BEFORE INSERT ON public.milestones
FOR EACH ROW EXECUTE FUNCTION public.validate_milestone_trip();
