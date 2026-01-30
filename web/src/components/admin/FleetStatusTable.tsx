'use client';

import { useVehicles, useToggleVehicleAvailability } from '@/lib/queries/vehicles';
import { useActiveTrips } from '@/lib/queries/trips';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Truck, Loader2, Plus, Lock } from 'lucide-react';
import { AddVehicleModal } from './AddVehicleModal';
import { AddDriverModal } from './AddDriverModal';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function FleetStatusTable() {
    const { data: vehicles, isLoading: vehiclesLoading, error } = useVehicles();
    const { data: activeTrips } = useActiveTrips();
    const toggleMutation = useToggleVehicleAvailability();
    const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
    const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

    const busyVehicleIds = new Set(activeTrips?.map(t => t.vehicle_id).filter(Boolean));

    const handleToggle = (id: string, currentStatus: boolean) => {
        toggleMutation.mutate({ vehicleId: id, isAvailable: !currentStatus });
    };

    if (vehiclesLoading) {
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
                    Failed to load fleet data
                </CardContent>
            </Card>
        );
    }

    const availableCount = vehicles?.filter((v) => v.is_available).length ?? 0;
    const totalCount = vehicles?.length ?? 0;

    return (
        <Card className="h-full flex flex-col border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Vehicle Fleet
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                            {availableCount}/{totalCount} Available
                        </Badge>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setIsAddDriverOpen(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Driver
                            </Button>
                            <Button size="sm" onClick={() => setIsAddVehicleOpen(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Vehicle
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0 flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Reg. Number</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehicles?.map((vehicle) => {
                            const isBusy = busyVehicleIds.has(vehicle.id);
                            return (
                                <TableRow key={vehicle.id} className="group">
                                    <TableCell className="font-mono font-medium">
                                        {vehicle.registration_number}
                                    </TableCell>
                                    <TableCell className="capitalize">{vehicle.vehicle_type}</TableCell>
                                    <TableCell>{vehicle.capacity_kg} kg</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            {isBusy ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center gap-2 opacity-80 cursor-not-allowed">
                                                                <Lock className="h-4 w-4 text-yellow-500" />
                                                                <span className="text-xs font-medium text-yellow-600 w-16 text-center">
                                                                    On Trip
                                                                </span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Status locked. Vehicle is currently on an active shipment.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <>
                                                    <Switch
                                                        checked={vehicle.is_available}
                                                        onCheckedChange={() =>
                                                            handleToggle(vehicle.id, vehicle.is_available)
                                                        }
                                                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300"
                                                    />
                                                    <span
                                                        className={`text-xs font-medium w-16 text-center ${vehicle.is_available
                                                            ? 'text-emerald-600'
                                                            : 'text-muted-foreground'
                                                            }`}
                                                    >
                                                        {vehicle.is_available ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {vehicles?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No vehicles in fleet. Add vehicles to get started.
                    </div>
                )}
            </CardContent>

            <AddVehicleModal open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen} />
            <AddDriverModal open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen} />
        </Card>
    );
}
