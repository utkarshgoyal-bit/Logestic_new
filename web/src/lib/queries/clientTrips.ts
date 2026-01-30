'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Trip, Profile, Vehicle, Milestone } from '@/types/database';

const CLIENT_TRIPS_KEY = ['client', 'trips'];

// Fetch all trips for the current client
export function useClientTrips() {
    const supabase = createClient();

    return useQuery({
        queryKey: CLIENT_TRIPS_KEY,
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('trips')
                .select(`
                    *,
                    driver:profiles!trips_driver_id_fkey (id, full_name, phone),
                    vehicle:vehicles!trips_vehicle_id_fkey (id, registration_number, vehicle_type)
                `)
                .eq('client_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as (Trip & { driver: Profile | null; vehicle: Vehicle | null })[];
        },
    });
}

// Fetch milestones for a specific trip
export function useClientTripMilestones(tripId: string | undefined) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['client', 'milestones', tripId],
        queryFn: async () => {
            if (!tripId) return [];

            const { data, error } = await supabase
                .from('milestones')
                .select('*')
                .eq('trip_id', tripId)
                .order('recorded_at', { ascending: true });

            if (error) throw error;
            return data as Milestone[];
        },
        enabled: !!tripId,
    });
}

// Create a new trip request
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateTrip() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newTrip: {
            client_id: string;
            pickup_location: string;
            drop_location: string;
            billed_amount: number;
            status: 'pending';
        }) => {
            const { data, error } = await supabase
                .from('trips')
                .insert(newTrip)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CLIENT_TRIPS_KEY });
        },
    });
}
