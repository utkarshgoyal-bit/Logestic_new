'use client';

import { useVehicles, useToggleVehicleAvailability } from '@/lib/queries/vehicles';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Package, Loader2, Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { AddVehicleModal } from './AddVehicleModal';
import { AddDriverModal } from './AddDriverModal';

export function FleetStatusTable() {
    const { data: vehicles, isLoading, error } = useVehicles();
    const toggleMutation = useToggleVehicleAvailability();
    const [showAddVehicle, setShowAddVehicle] = useState(false);
    const [showAddDriver, setShowAddDriver] = useState(false);

    const handleToggle = (vehicleId: string, currentValue: boolean) => {
        toggleMutation.mutate({
            vehicleId,
            isAvailable: !currentValue,
        });
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
                    Failed to load fleet data
                </CardContent>
            </Card>
        );
    }

    const availableCount = vehicles?.filter((v) => v.is_available).length ?? 0;
    const totalCount = vehicles?.length ?? 0;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Truck className="h-5 w-5 text-primary" />
                        Fleet Governance
                    </CardTitle>
                    <Badge variant="outline" className="text-sm">
                        {availableCount}/{totalCount} Available
                    </Badge>
                </div>
                <div className="flex justify-end mt-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowAddDriver(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Driver
                    </Button>
                    <Button size="sm" onClick={() => setShowAddVehicle(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vehicle
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[200px]">Registration</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Capacity</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehicles?.map((vehicle) => (
                            <TableRow key={vehicle.id} className="group">
                                <TableCell className="font-mono font-medium">
                                    {vehicle.registration_number}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        {vehicle.vehicle_type}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="text-muted-foreground">
                                        {vehicle.capacity_kg.toLocaleString()} kg
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-2">
                                        <Switch
                                            checked={vehicle.is_available}
                                            onCheckedChange={() =>
                                                handleToggle(vehicle.id, vehicle.is_available)
                                            }
                                            className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-muted"
                                        />
                                        <span
                                            className={`text-xs font-medium w-16 ${vehicle.is_available
                                                ? 'text-accent'
                                                : 'text-muted-foreground'
                                                }`}
                                        >
                                            {vehicle.is_available ? 'Available' : 'In Use'}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {vehicles?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No vehicles in fleet. Add vehicles to get started.
                    </div>
                )}
            </CardContent>
            <AddVehicleModal open={showAddVehicle} onOpenChange={setShowAddVehicle} />
            <AddDriverModal open={showAddDriver} onOpenChange={setShowAddDriver} />
        </Card>
    );
}
