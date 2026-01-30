'use client';

import { useState } from 'react';
import { useAddMilestone } from '@/lib/queries/driverTrips';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Fuel, Coffee, Receipt } from 'lucide-react';
import type { MilestoneType } from '@/types/database';

interface MilestoneFormProps {
    tripId: string;
    open: boolean;
    onClose: () => void;
}

const milestoneTypes: { value: MilestoneType; label: string; icon: React.ElementType }[] = [
    { value: 'break', label: 'Rest Break', icon: Coffee },
    { value: 'fuel', label: 'Fuel Stop', icon: Fuel },
    { value: 'toll', label: 'Toll Payment', icon: Receipt },
];

export function MilestoneForm({ tripId, open, onClose }: MilestoneFormProps) {
    const [type, setType] = useState<MilestoneType>('break');
    const [locationName, setLocationName] = useState('');
    const [fuelCost, setFuelCost] = useState('');
    const [liters, setLiters] = useState('');
    const [tollAmount, setTollAmount] = useState('');
    const [duration, setDuration] = useState('');

    const addMilestone = useAddMilestone();

    const handleSubmit = async () => {
        const metadata: Record<string, unknown> = {};

        if (type === 'fuel') {
            if (fuelCost) metadata.fuel_cost = parseFloat(fuelCost);
            if (liters) metadata.liters = parseFloat(liters);
        } else if (type === 'toll') {
            if (tollAmount) metadata.toll_amount = parseFloat(tollAmount);
        } else if (type === 'break') {
            if (duration) metadata.duration_mins = parseInt(duration, 10);
        }

        await addMilestone.mutateAsync({
            tripId,
            type,
            locationName: locationName || undefined,
            metadata,
        });

        // Reset and close
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setType('break');
        setLocationName('');
        setFuelCost('');
        setLiters('');
        setTollAmount('');
        setDuration('');
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            resetForm();
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Log Milestone
                    </DialogTitle>
                    <DialogDescription>
                        Record a trip event with optional expense details.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Milestone Type */}
                    <div className="space-y-2">
                        <Label>Event Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as MilestoneType)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {milestoneTypes.map((mt) => (
                                    <SelectItem key={mt.value} value={mt.value}>
                                        <div className="flex items-center gap-2">
                                            <mt.icon className="h-4 w-4" />
                                            {mt.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location Name */}
                    <div className="space-y-2">
                        <Label>Location (optional)</Label>
                        <Input
                            placeholder="e.g., HP Petrol Pump, Igatpuri"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                        />
                    </div>

                    {/* Dynamic fields based on type */}
                    {type === 'fuel' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Fuel Cost (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 3500"
                                    value={fuelCost}
                                    onChange={(e) => setFuelCost(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Liters</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 50"
                                    value={liters}
                                    onChange={(e) => setLiters(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {type === 'toll' && (
                        <div className="space-y-2">
                            <Label>Toll Amount (₹)</Label>
                            <Input
                                type="number"
                                placeholder="e.g., 450"
                                value={tollAmount}
                                onChange={(e) => setTollAmount(e.target.value)}
                            />
                        </div>
                    )}

                    {type === 'break' && (
                        <div className="space-y-2">
                            <Label>Duration (minutes)</Label>
                            <Input
                                type="number"
                                placeholder="e.g., 20"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={addMilestone.isPending}>
                        {addMilestone.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Log Milestone'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
