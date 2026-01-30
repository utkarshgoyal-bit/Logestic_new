'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Truck, User, Phone, Loader2, CheckCircle } from 'lucide-react';
import { useUpdateTripStatus, useAddMilestone } from '@/lib/queries/driverTrips';
import type { Trip, Profile, Vehicle } from '@/types/database';

interface DriverTripCardProps {
    trip: Trip & { client: Profile; vehicle: Vehicle };
}

export function DriverTripCard({ trip }: DriverTripCardProps) {
    const updateStatus = useUpdateTripStatus();
    const addMilestone = useAddMilestone();

    const isAssigned = trip.status === 'assigned';
    const isActive = trip.status === 'active';

    const handleArrivedAtPickup = async () => {
        // Add pickup milestone and transition to active
        await addMilestone.mutateAsync({
            tripId: trip.id,
            type: 'pickup',
            locationName: trip.pickup_location || 'Pickup Location',
            metadata: { action: 'arrived', timestamp: new Date().toISOString() },
        });

        await updateStatus.mutateAsync({
            tripId: trip.id,
            status: 'active',
        });
    };

    const handleCompleteTrip = async () => {
        // Add drop milestone and transition to completed
        await addMilestone.mutateAsync({
            tripId: trip.id,
            type: 'drop',
            locationName: trip.drop_location || 'Drop Location',
            metadata: { action: 'delivered', timestamp: new Date().toISOString() },
        });

        await updateStatus.mutateAsync({
            tripId: trip.id,
            status: 'completed',
        });
    };

    const isPending = updateStatus.isPending || addMilestone.isPending;

    return (
        <Card className="w-full border-l-4 border-l-primary shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Active Assignment
                </CardTitle>
                <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className={isActive ? 'bg-accent text-accent-foreground' : ''}
                >
                    {trip.status.toUpperCase()}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Route Info */}
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Route</p>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent shrink-0" />
                        <span className="font-semibold text-sm truncate">{trip.pickup_location || 'TBD'}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-sm truncate">{trip.drop_location || 'TBD'}</span>
                    </div>
                </div>

                {/* Client & Vehicle Info */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Client</p>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium truncate">{trip.client?.full_name}</span>
                        </div>
                        {trip.client?.phone && (
                            <div className="flex items-center gap-2 mt-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{trip.client.phone}</span>
                            </div>
                        )}
                    </div>

                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Vehicle</p>
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-mono font-medium">{trip.vehicle?.registration_number}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{trip.vehicle?.vehicle_type}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                    {isAssigned && (
                        <Button
                            className="w-full h-12 text-base font-semibold"
                            onClick={handleArrivedAtPickup}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Arrived at Pickup
                                </>
                            )}
                        </Button>
                    )}

                    {isActive && (
                        <Button
                            className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90"
                            onClick={handleCompleteTrip}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Complete Delivery
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
