'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Trip, Profile, Vehicle } from '@/types/database';

const TRIPS_KEY = ['trips'];
const PENDING_TRIPS_KEY = ['trips', 'pending'];
const DRIVERS_KEY = ['drivers'];

// Fetch pending trips with client info
export function usePendingTrips() {
    const supabase = createClient();

    return useQuery({
        queryKey: PENDING_TRIPS_KEY,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('trips')
                .select(`
          *,
          client:profiles!trips_client_id_fkey (
            id, full_name, phone
          )
        `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as (Trip & { client: Profile })[];
        },
    });
}

// Fetch active/assigned trips
export function useActiveTrips() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['trips', 'active'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('trips')
                .select(`
          *,
          client:profiles!trips_client_id_fkey (
            id, full_name, phone
          ),
          driver:profiles!trips_driver_id_fkey (
             id, full_name, phone
          ),
          vehicle:vehicles!trips_vehicle_id_fkey (
             id, registration_number, vehicle_type
          )
        `)
                .in('status', ['assigned', 'active'])
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return data as (Trip & { client: Profile; driver: Profile; vehicle: Vehicle })[];
        },
    });
}

// Fetch available drivers
export function useAvailableDrivers() {
    const supabase = createClient();

    return useQuery({
        queryKey: DRIVERS_KEY,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'driver')
                .eq('is_active', true)
                .order('full_name');

            if (error) throw error;
            return data as Profile[];
        },
    });
}

// Fetch available vehicles for assignment
export function useAvailableVehicles() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['vehicles', 'available'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('is_available', true)
                .order('registration_number');

            if (error) throw error;
            return data as Vehicle[];
        },
    });
}

// Assign trip to driver and vehicle
export function useAssignTrip() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            tripId,
            driverId,
            vehicleId,
            status
        }: {
            tripId: string;
            driverId: string;
            vehicleId: string;
            status?: 'assigned' | 'active';
        }) => {
            const { error } = await supabase
                .from('trips')
                .update({
                    driver_id: driverId,
                    vehicle_id: vehicleId,
                    status: status || 'assigned',
                })
                .eq('id', tripId);

            if (error) throw error;
        },

        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: TRIPS_KEY });
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        },
    });
}

// Update trip details (e.g. amount, notes)
export function useUpdateTrip() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Trip> }) => {
            const { data, error } = await supabase
                .from('trips')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) throw new Error("Update failed: Trip not found or permission denied (RLS).");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRIPS_KEY });
        },
    });
}

// Delete a trip request
export function useDeleteTrip() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('trips')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRIPS_KEY });
        },
    });
}
