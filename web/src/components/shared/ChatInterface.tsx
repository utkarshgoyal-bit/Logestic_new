'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { useTripMessages, useSendMessage } from '@/lib/queries/chat';
import type { Trip, Profile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

interface ChatInterfaceProps {
    trip: (Trip & { client?: Profile }) | null;
    open: boolean;
    onClose: () => void;
}

export function ChatInterface({ trip, open, onClose }: ChatInterfaceProps) {
    const [newMessage, setNewMessage] = useState('');
    const { data: messages, isLoading } = useTripMessages(trip?.id || null);
    const sendMessage = useSendMessage();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    // Fetch current user ID for alignment
    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };
        fetchUser();
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !trip) return;

        try {
            await sendMessage.mutateAsync({
                tripId: trip.id,
                content: newMessage
            });
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[500px] flex flex-col h-[600px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Negotiation Chat</DialogTitle>
                    <DialogDescription>
                        Discussing Trip #{trip?.id.slice(0, 8)} with {trip?.client?.full_name || 'Client'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-2 bg-secondary/5">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages?.length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-10">
                                    No messages yet. Start the conversation!
                                </p>
                            )}
                            {messages?.map((msg) => {
                                const isMe = msg.sender_id === currentUserId;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${isMe
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-white border text-foreground'
                                                }`}
                                        >
                                            {!isMe && <p className="text-[10px] opacity-70 mb-0.5">{msg.sender?.full_name}</p>}
                                            <p>{msg.content}</p>
                                            <span className="text-[10px] opacity-50 block text-right mt-1">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-background">
                    <form onSubmit={handleSend} className="flex w-full items-center gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sendMessage.isPending}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={sendMessage.isPending || !newMessage.trim()}>
                            {sendMessage.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
