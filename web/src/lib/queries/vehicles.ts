'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Vehicle } from '@/types/database';

const VEHICLES_KEY = ['vehicles'];

// Fetch all vehicles
export function useVehicles() {
    const supabase = createClient();

    return useQuery({
        queryKey: VEHICLES_KEY,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .order('registration_number');

            if (error) throw error;
            return data as Vehicle[];
        },
    });
}

// Toggle vehicle availability with optimistic update
export function useToggleVehicleAvailability() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            vehicleId,
            isAvailable,
        }: {
            vehicleId: string;
            isAvailable: boolean;
        }) => {
            const { error } = await supabase
                .from('vehicles')
                .update({ is_available: isAvailable })
                .eq('id', vehicleId);

            if (error) throw error;
        },

        // Optimistic update: flip the switch immediately
        onMutate: async ({ vehicleId, isAvailable }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: VEHICLES_KEY });

            // Snapshot the previous value
            const previousVehicles = queryClient.getQueryData<Vehicle[]>(VEHICLES_KEY);

            // Optimistically update
            queryClient.setQueryData<Vehicle[]>(VEHICLES_KEY, (old) =>
                old?.map((v) =>
                    v.id === vehicleId ? { ...v, is_available: isAvailable } : v
                )
            );

            return { previousVehicles };
        },

        // Rollback on error
        onError: (_err, _variables, context) => {
            if (context?.previousVehicles) {
                queryClient.setQueryData(VEHICLES_KEY, context.previousVehicles);
            }
        },

        // Refetch after success or error
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
        },
    });
}
// Create a new vehicle
export function useCreateVehicle() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newVehicle: {
            registration_number: string;
            vehicle_type: string;
            capacity_kg: number;
        }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('vehicles')
                .insert({
                    ...newVehicle,
                    is_available: true,
                    admin_id: user.id
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
        },
    });
}

// Create a new driver (Profile)
export function useCreateDriver() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newDriver: {
            full_name: string;
            phone: string;
        }) => {
            const { error: authError } = await supabase.auth.getUser();
            if (authError) throw new Error('Not authenticated');

            // Generate a random UUID for the driver profile
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    id: crypto.randomUUID(),
                    full_name: newDriver.full_name,
                    phone: newDriver.phone,
                    role: 'driver',
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Invalidate drivers query (if it exists, e.g. in trips or a dedicated drivers list)
            // Also invalidate vehicles just in case there's a relation, though mostly separate.
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        },
    });
}
