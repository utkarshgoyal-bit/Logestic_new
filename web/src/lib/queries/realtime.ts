'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Trip } from '@/types/database';

/**
 * Hook to subscribe to real-time trip changes
 * Automatically invalidates the trips query when data changes
 */
export function useRealtimeTrips() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel('trips-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'trips',
                },
                (payload) => {
                    console.log('[Realtime] Trip change:', payload.eventType, payload);

                    // Invalidate all trip-related queries
                    queryClient.invalidateQueries({ queryKey: ['trips'] });
                    queryClient.invalidateQueries({ queryKey: ['pending-trips'] });
                    queryClient.invalidateQueries({ queryKey: ['driver', 'active-trip'] });

                    // Also invalidate vehicles since trip status affects availability
                    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, queryClient]);
}

/**
 * Hook to subscribe to real-time milestone changes for a specific trip
 */
export function useRealtimeMilestones(tripId: string | undefined) {
    const queryClient = useQueryClient();
    const supabase = createClient();

    useEffect(() => {
        if (!tripId) return;

        const channel = supabase
            .channel(`milestones-${tripId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'milestones',
                    filter: `trip_id=eq.${tripId}`,
                },
                (payload) => {
                    console.log('[Realtime] New milestone:', payload);

                    // Invalidate milestones for this trip
                    queryClient.invalidateQueries({ queryKey: ['milestones', tripId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tripId, supabase, queryClient]);
}

/**
 * Hook to subscribe to vehicle availability changes
 */
export function useRealtimeVehicles() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel('vehicles-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'vehicles',
                },
                (payload) => {
                    console.log('[Realtime] Vehicle change:', payload);

                    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
                    queryClient.invalidateQueries({ queryKey: ['available-vehicles'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, queryClient]);
}
