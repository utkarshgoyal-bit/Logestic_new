-- =============================================================================
-- Lean Tripartite Logistics Management System - Seed Data for Testing
-- Run this file AFTER all other SQL files to populate test data
-- =============================================================================

-- NOTE: In production, users are created via Supabase Auth.
-- This seed file creates profiles directly for testing RLS and triggers.
-- You'll need to create corresponding auth.users entries or use the Auth UI.


-- =============================================================================
-- 1. TEST PROFILES (Manual insertion for testing)
-- =============================================================================

-- First, create test users in Supabase Auth Dashboard, then update these UUIDs
-- Or use these placeholder UUIDs for local testing

INSERT INTO public.profiles (id, full_name, phone, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin User', '+91-9876543210', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Client Company ABC', '+91-9876543211', 'client'),
  ('00000000-0000-0000-0000-000000000003', 'Client Company XYZ', '+91-9876543212', 'client'),
  ('00000000-0000-0000-0000-000000000004', 'Driver Ramesh Kumar', '+91-9876543213', 'driver'),
  ('00000000-0000-0000-0000-000000000005', 'Driver Suresh Singh', '+91-9876543214', 'driver');


-- =============================================================================
-- 2. TEST VEHICLES
-- =============================================================================

INSERT INTO public.vehicles (id, registration_number, vehicle_type, capacity_kg, is_available, admin_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'MH-01-AB-1234', 'Tata Ace', 750, true, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'MH-02-CD-5678', 'Eicher 14ft', 3500, true, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', 'MH-03-EF-9012', 'Tata 407', 2500, true, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000004', 'MH-04-GH-3456', 'Ashok Leyland 32ft', 15000, false, '00000000-0000-0000-0000-000000000001');


-- =============================================================================
-- 3. TEST TRIPS
-- =============================================================================

-- Pending trip (client created, awaiting admin assignment)
INSERT INTO public.trips (id, client_id, status, pickup_location, drop_location, billed_amount) VALUES
  ('20000000-0000-0000-0000-000000000001', 
   '00000000-0000-0000-0000-000000000002', 
   'pending', 
   'Mumbai Port, Dock 5', 
   'Pune MIDC, Phase 2', 
   15000);

-- Assigned trip (admin assigned driver and vehicle)
INSERT INTO public.trips (id, client_id, driver_id, vehicle_id, status, pickup_location, drop_location, billed_amount) VALUES
  ('20000000-0000-0000-0000-000000000002', 
   '00000000-0000-0000-0000-000000000002', 
   '00000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000001',
   'assigned', 
   'Andheri Warehouse', 
   'Nashik Industrial Area', 
   8500);

-- Active trip (driver started the journey)
INSERT INTO public.trips (id, client_id, driver_id, vehicle_id, status, pickup_location, drop_location, billed_amount, amount_received) VALUES
  ('20000000-0000-0000-0000-000000000003', 
   '00000000-0000-0000-0000-000000000003', 
   '00000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000002',
   'active', 
   'Thane Godown', 
   'Nagpur Central Warehouse', 
   45000,
   20000);

-- Completed trip
INSERT INTO public.trips (id, client_id, driver_id, vehicle_id, status, pickup_location, drop_location, billed_amount, amount_received) VALUES
  ('20000000-0000-0000-0000-000000000004', 
   '00000000-0000-0000-0000-000000000002', 
   '00000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000003',
   'completed', 
   'Kalyan Factory', 
   'Aurangabad Hub', 
   12000,
   12000);


-- =============================================================================
-- 4. TEST MILESTONES (for active trip)
-- =============================================================================

INSERT INTO public.milestones (trip_id, type, location_name, recorded_at, metadata) VALUES
  ('20000000-0000-0000-0000-000000000003', 'pickup', 'Thane Godown - Gate 3', now() - interval '4 hours', '{"notes": "Loaded 2 pallets"}'),
  ('20000000-0000-0000-0000-000000000003', 'fuel', 'HP Petrol Pump, Igatpuri', now() - interval '2 hours', '{"fuel_cost": 3500, "liters": 50}'),
  ('20000000-0000-0000-0000-000000000003', 'toll', 'Maharashtra Border Toll', now() - interval '1 hour', '{"toll_amount": 450}'),
  ('20000000-0000-0000-0000-000000000003', 'break', 'Dhaba Rest Stop', now() - interval '30 minutes', '{"duration_mins": 20}');


-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check profiles count by role
SELECT role, COUNT(*) as count FROM public.profiles GROUP BY role;

-- Check vehicle availability
SELECT registration_number, vehicle_type, is_available FROM public.vehicles;

-- Check trips by status
SELECT status, COUNT(*) as count FROM public.trips GROUP BY status;

-- View active trip with milestones
SELECT 
  t.id,
  t.status,
  t.pickup_location,
  t.drop_location,
  m.type as milestone_type,
  m.location_name,
  m.metadata
FROM public.trips t
LEFT JOIN public.milestones m ON m.trip_id = t.id
WHERE t.status = 'active';
