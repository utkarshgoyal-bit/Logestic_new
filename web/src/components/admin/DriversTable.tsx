'use client';

import { useDrivers } from '@/lib/queries/vehicles';
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
import { User, Loader2, Phone, UserPlus } from 'lucide-react';
import { AddDriverModal } from './AddDriverModal';
import { useState } from 'react';

export function DriversTable() {
    const { data: drivers, isLoading, error } = useDrivers();
    const [showAddDriver, setShowAddDriver] = useState(false);

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
                    Failed to load drivers
                </CardContent>
            </Card>
        );
    }

    const availableCount = drivers?.filter((d) => d.is_available).length ?? 0;
    const totalCount = drivers?.length ?? 0;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <User className="h-5 w-5 text-primary" />
                        Drivers
                    </CardTitle>
                    <Badge variant="outline" className="text-sm">
                        {availableCount}/{totalCount} Available
                    </Badge>
                </div>
                <div className="flex justify-end mt-2">
                    <Button size="sm" onClick={() => setShowAddDriver(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Driver
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[200px]">Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Account</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {drivers?.map((driver) => (
                            <TableRow key={driver.id} className="group">
                                <TableCell className="font-medium">
                                    {driver.full_name}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {driver.phone}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center">
                                        <Badge
                                            variant="outline"
                                            className={`${driver.is_available
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                                                    : 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
                                                }`}
                                        >
                                            {driver.is_available ? 'Available' : 'In Use'}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span
                                        className={`text-xs ${driver.is_active ? 'text-green-600' : 'text-muted-foreground'
                                            }`}
                                    >
                                        {driver.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {drivers?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No drivers found. Add drivers to get started.
                    </div>
                )}
            </CardContent>
            <AddDriverModal open={showAddDriver} onOpenChange={setShowAddDriver} />
        </Card>
    );
}
