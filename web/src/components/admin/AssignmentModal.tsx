'use client';

import { useState } from 'react';
import { useAvailableDrivers, useAvailableVehicles, useAssignTrip } from '@/lib/queries/trips';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Truck, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import type { Trip, Profile } from '@/types/database';

interface AssignmentModalProps {
    trip: (Trip & { client: Profile }) | null;
    onClose: () => void;
}

export function AssignmentModal({ trip, onClose }: AssignmentModalProps) {
    const [driverId, setDriverId] = useState<string>('');
    const [vehicleId, setVehicleId] = useState<string>('');

    const { data: drivers, isLoading: driversLoading } = useAvailableDrivers();
    const { data: vehicles, isLoading: vehiclesLoading } = useAvailableVehicles();

    // Filter to show only available resources
    const availableDrivers = drivers?.filter(d => d.is_available) ?? [];
    const availableVehicles = vehicles?.filter(v => v.is_available) ?? [];

    const assignMutation = useAssignTrip();

    const handleAssign = async () => {
        if (!trip || !driverId || !vehicleId) return;

        await assignMutation.mutateAsync({
            tripId: trip.id,
            driverId,
            vehicleId,
            status: 'assigned'
        });

        // Reset and close
        setDriverId('');
        setVehicleId('');
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setDriverId('');
            setVehicleId('');
            onClose();
        }
    };

    const isLoading = driversLoading || vehiclesLoading;
    const canAssign = driverId && vehicleId && !assignMutation.isPending;

    return (
        <Dialog open={!!trip} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        Assign Trip
                    </DialogTitle>
                    <DialogDescription>
                        Select a driver and available vehicle for this booking.
                    </DialogDescription>
                </DialogHeader>

                {trip && (
                    <div className="space-y-4">
                        {/* Trip Info Card */}
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{trip.client?.full_name}</span>
                                <Badge variant="outline">₹{trip.billed_amount.toLocaleString()}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 text-accent" />
                                <span className="truncate">{trip.pickup_location || 'TBD'}</span>
                                <ArrowRight className="h-4 w-4" />
                                <span className="truncate">{trip.drop_location || 'TBD'}</span>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Driver Select */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Select Driver
                                    </label>
                                    <Select value={driverId} onValueChange={setDriverId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a driver..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {drivers?.map((driver) => (
                                                <SelectItem key={driver.id} value={driver.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{driver.full_name}</span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {driver.phone}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {availableDrivers.length === 0 && (
                                                <div className="p-2 text-sm text-muted-foreground">
                                                    No active drivers available
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Vehicle Select */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Truck className="h-4 w-4" />
                                        Select Vehicle
                                    </label>
                                    <Select value={vehicleId} onValueChange={setVehicleId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a vehicle..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableVehicles.map((vehicle) => (
                                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono">
                                                            {vehicle.registration_number}
                                                        </span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {vehicle.vehicle_type}
                                                        </Badge>
                                                        <span className="text-muted-foreground text-xs">
                                                            {vehicle.capacity_kg.toLocaleString()} kg
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {vehicles?.length === 0 && (
                                                <div className="p-2 text-sm text-muted-foreground">
                                                    No vehicles available
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={!canAssign}
                    >
                        {assignMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            'Confirm Assignment'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
