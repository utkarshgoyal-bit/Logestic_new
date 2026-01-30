'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Milestone, MilestoneType, MilestoneMetadata, Trip, Profile, Vehicle } from '@/types/database';

const MILESTONES_KEY = (tripId: string) => ['milestones', tripId];
const DRIVER_TRIP_KEY = ['driver', 'active-trip'];

// Fetch milestones for a specific trip
export function useTripMilestones(tripId: string | undefined) {
    const supabase = createClient();

    return useQuery({
        queryKey: tripId ? MILESTONES_KEY(tripId) : ['milestones'],
        queryFn: async () => {
            if (!tripId) return [];

            const { data, error } = await supabase
                .from('milestones')
                .select('*')
                .eq('trip_id', tripId)
                .order('recorded_at', { ascending: false });

            if (error) throw error;
            return data as Milestone[];
        },
        enabled: !!tripId,
    });
}

// Fetch driver's current active/assigned trip
export function useDriverActiveTrip() {
    const supabase = createClient();

    return useQuery({
        queryKey: DRIVER_TRIP_KEY,
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('trips')
                .select(`
                    *,
                    client:profiles!trips_client_id_fkey (id, full_name, phone),
                    vehicle:vehicles!trips_vehicle_id_fkey (id, registration_number, vehicle_type)
                `)
                .eq('driver_id', user.id)
                .in('status', ['assigned', 'active'])
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data as (Trip & { client: Profile; vehicle: Vehicle }) | null;
        },
    });
}

// Add a new milestone to a trip
export function useAddMilestone() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            tripId,
            type,
            locationName,
            metadata = {},
        }: {
            tripId: string;
            type: MilestoneType;
            locationName?: string;
            metadata?: MilestoneMetadata;
        }) => {
            const { data, error } = await supabase
                .from('milestones')
                .insert({
                    trip_id: tripId,
                    type,
                    location_name: locationName,
                    metadata,
                    recorded_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            return data as Milestone;
        },

        onSuccess: (data) => {
            // Invalidate milestones for this trip
            queryClient.invalidateQueries({ queryKey: MILESTONES_KEY(data.trip_id) });
        },
    });
}

// Update trip status (assigned → active → completed)
export function useUpdateTripStatus() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            tripId,
            status,
        }: {
            tripId: string;
            status: 'active' | 'completed';
        }) => {
            const { error } = await supabase
                .from('trips')
                .update({ status })
                .eq('id', tripId);

            if (error) throw error;
        },

        onSuccess: () => {
            // Invalidate driver's active trip and vehicles (availability may change)
            queryClient.invalidateQueries({ queryKey: DRIVER_TRIP_KEY });
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        },
    });
}
