'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
// type import removed

export type Message = {
    id: string;
    trip_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    sender?: {
        full_name: string;
        role: string;
    };
};

const MESSAGES_KEY = 'messages';

export function useTripMessages(tripId: string | null) {
    const supabase = createClient();
    const queryClient = useQueryClient();

    // 1. Initial Fetch
    const query = useQuery({
        queryKey: [MESSAGES_KEY, tripId],
        queryFn: async () => {
            if (!tripId) return [];
            const { data, error } = await supabase
                .from('messages')
                .select('*, sender:profiles!messages_sender_id_fkey(full_name, role)')
                .eq('trip_id', tripId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data as Message[];
        },
        enabled: !!tripId,
    });

    // 2. Realtime Subscription
    useEffect(() => {
        if (!tripId) return;

        const channel = supabase
            .channel(`messages:${tripId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `trip_id=eq.${tripId}`,
                },
                (payload) => {
                    // Optimistic update or refetch
                    // Refetch is safer for joining 'sender' profile info
                    queryClient.invalidateQueries({ queryKey: [MESSAGES_KEY, tripId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tripId, queryClient, supabase]);

    return query;
}

export function useSendMessage() {
    const supabase = createClient();

    return useMutation({
        mutationFn: async ({ tripId, content }: { tripId: string; content: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('messages')
                .insert({
                    trip_id: tripId,
                    sender_id: user.id,
                    content: content
                });

            if (error) throw error;
        }
    });
}
