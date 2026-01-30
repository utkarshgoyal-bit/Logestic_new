'use client';

import { useState } from 'react';
import { usePendingTrips } from '@/lib/queries/trips';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, MapPin, ArrowRight, Loader2, IndianRupee } from 'lucide-react';
import type { Trip, Profile } from '@/types/database';
import { AssignmentModal } from './AssignmentModal';
import { EditTripModal } from './EditTripModal';
import { PaymentModal } from './PaymentModal';
import { ChatInterface } from '@/components/shared/ChatInterface';
import { useDeleteTrip } from '@/lib/queries/trips';
// Dropdown imports removed to use inline buttons due to missing component

import { MoreVertical, Pencil, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function BookingRequestQueue() {
    const { data: trips, isLoading, error } = usePendingTrips();
    const deleteTrip = useDeleteTrip();

    // State for different actions
    const [selectedTrip, setSelectedTrip] = useState<(Trip & { client: Profile }) | null>(null); // For Assignment
    const [editingTrip, setEditingTrip] = useState<(Trip & { client: Profile }) | null>(null);
    const [paymentTrip, setPaymentTrip] = useState<(Trip & { client: Profile }) | null>(null);
    const [chattingTrip, setChattingTrip] = useState<(Trip & { client: Profile }) | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this booking request?")) return;
        try {
            await deleteTrip.mutateAsync(id);
            toast.success("Booking request deleted");
        } catch (error) {
            toast.error("Failed to delete request");
        }
    };

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center h-64 text-destructive">
                    Failed to load booking requests
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            Pending Requests
                        </CardTitle>
                        <Badge variant="secondary" className="text-sm">
                            {trips?.length ?? 0} Pending
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto space-y-3">
                    {trips?.map((trip) => (
                        <div
                            key={trip.id}
                            className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors"
                        >
                            {/* Client Info */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-sm">
                                    {trip.client?.full_name || 'Unknown Client'}
                                </span>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                    <IndianRupee className="h-3 w-3 mr-1" />
                                    {trip.billed_amount.toLocaleString()}
                                </Badge>
                                <div className="flex justify-end gap-1 mt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingTrip(trip)}
                                        title="Edit Details"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPaymentTrip(trip)}
                                        title="Manage Payments"
                                    >
                                        <IndianRupee className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setChattingTrip(trip)}
                                        title="Chat with Client"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(trip.id)}
                                        title="Delete Request"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Route */}
                            < div className="flex items-center gap-2 text-sm text-muted-foreground mb-3" >
                                <MapPin className="h-4 w-4 text-accent shrink-0" />
                                <span className="truncate">{trip.pickup_location || 'TBD'}</span>
                                <ArrowRight className="h-4 w-4 shrink-0" />
                                <span className="truncate">{trip.drop_location || 'TBD'}</span>
                            </div>

                            {/* Actions */}
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => setSelectedTrip(trip)}
                            >
                                Assign Driver & Vehicle
                            </Button>
                        </div>
                    ))}

                    {trips?.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            No pending requests
                        </div>
                    )}
                </CardContent >
            </Card >

            <AssignmentModal
                trip={selectedTrip}
                onClose={() => setSelectedTrip(null)}
            />
            <EditTripModal
                trip={editingTrip}
                onClose={() => setEditingTrip(null)}
            />
            <PaymentModal
                trip={paymentTrip}
                onClose={() => setPaymentTrip(null)}
            />
            <ChatInterface
                trip={chattingTrip}
                open={!!chattingTrip}
                onClose={() => setChattingTrip(null)}
            />
        </>
    );
}
