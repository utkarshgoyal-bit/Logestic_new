'use client';

import { useState } from 'react';
import { useActiveTrips } from '@/lib/queries/trips';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight, Loader2, IndianRupee, MessageSquare, Pencil, Truck, User } from 'lucide-react';
import type { Trip, Profile, Vehicle } from '@/types/database';
import { EditTripModal } from './EditTripModal';
import { PaymentModal } from './PaymentModal';
import { AssignmentModal } from './AssignmentModal';
import { ChatInterface } from '@/components/shared/ChatInterface';

export function ActiveTripsList() {
    const { data: trips, isLoading, error } = useActiveTrips();

    // Action states
    const [editingTrip, setEditingTrip] = useState<(Trip & { client?: Profile }) | null>(null);
    const [paymentTrip, setPaymentTrip] = useState<(Trip & { client?: Profile }) | null>(null);
    const [assigningTrip, setAssigningTrip] = useState<(Trip & { client?: Profile }) | null>(null);
    const [chattingTrip, setChattingTrip] = useState<(Trip & { client?: Profile }) | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-destructive">
                Failed to load active trips
            </div>
        );
    }

    return (
        <Card className="h-full border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle>Active Shipments</CardTitle>
                <CardDescription>Monitor ongoing trips and manage live operations.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                {trips?.length === 0 && (
                    <div className="text-center py-12 border rounded-lg border-dashed">
                        <Truck className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p className="text-muted-foreground">No active shipments currently.</p>
                    </div>
                )}

                {trips?.map((trip) => (
                    <div
                        key={trip.id}
                        className="p-4 rounded-lg bg-card border hover:border-primary/50 transition-all flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                    >
                        {/* Trip Info */}
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <Badge variant={trip.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                    {trip.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground font-mono">#{trip.id.slice(0, 8)}</span>
                                <span className="text-sm font-medium">• {trip.client?.full_name}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-accent shrink-0" />
                                <span className="truncate max-w-[150px]">{trip.pickup_location || 'TBD'}</span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[150px]">{trip.drop_location || 'TBD'}</span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {trip.vehicle && (
                                    <div className="flex items-center gap-1">
                                        <Truck className="h-3 w-3" />
                                        {trip.vehicle.registration_number}
                                    </div>
                                )}
                                {trip.driver && (
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {trip.driver.full_name}
                                    </div>
                                )}
                            </div>

                            {/* Financial Summary */}
                            <div className="flex gap-4 mt-2 text-xs border-t pt-2 w-fit">
                                <div>
                                    <span className="text-muted-foreground mr-1">Invoice:</span>
                                    <span className="font-medium">₹{trip.billed_amount?.toLocaleString() || 0}</span>
                                </div>
                                <div className={trip.amount_received > 0 ? "text-green-600" : "text-muted-foreground"}>
                                    <span className="mr-1">Paid:</span>
                                    <span className="font-medium">₹{trip.amount_received?.toLocaleString() || 0}</span>
                                </div>
                                {(trip.billed_amount - trip.amount_received) > 0 && (
                                    <div className="text-destructive">
                                        <span className="mr-1">Due:</span>
                                        <span className="font-bold">₹{(trip.billed_amount - trip.amount_received).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 self-end md:self-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAssigningTrip(trip)}
                                title="Assign Driver/Vehicle"
                            >
                                <Truck className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPaymentTrip(trip)}
                                title="Manage Payments"
                            >
                                <IndianRupee className="h-4 w-4 mr-1" />
                                Payments
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingTrip(trip)}
                                title="Edit Details"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setChattingTrip(trip)}
                                title="Chat"
                            >
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>

            {/* Reuse existing modals */}
            <EditTripModal trip={editingTrip} onClose={() => setEditingTrip(null)} />
            <PaymentModal trip={paymentTrip} onClose={() => setPaymentTrip(null)} />
            <AssignmentModal trip={assigningTrip} onClose={() => setAssigningTrip(null)} />
            <ChatInterface trip={chattingTrip} open={!!chattingTrip} onClose={() => setChattingTrip(null)} />
        </Card>
    );
}
