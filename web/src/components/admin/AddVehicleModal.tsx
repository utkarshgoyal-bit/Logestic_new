'use client';

import { useState } from 'react';
import { useCreateVehicle } from '@/lib/queries/vehicles';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddVehicleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddVehicleModal({ open, onOpenChange }: AddVehicleModalProps) {
    const [registration, setRegistration] = useState('');
    const [type, setType] = useState('');
    const [capacity, setCapacity] = useState('');

    const createVehicle = useCreateVehicle();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createVehicle.mutateAsync({
                registration_number: registration,
                vehicle_type: type,
                capacity_kg: Number(capacity)
            });
            toast.success('Vehicle added successfully');
            onOpenChange(false);
            setRegistration('');
            setType('');
            setCapacity('');
        } catch (error: any) {
            toast.error('Failed to add vehicle: ' + error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        Add New Vehicle
                    </DialogTitle>
                    <DialogDescription>
                        Register a new truck or vehicle to your fleet.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="registration">Registration Number</Label>
                        <Input
                            id="registration"
                            placeholder="e.g. KA-01-AB-1234"
                            value={registration}
                            onChange={(e) => setRegistration(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Vehicle Type</Label>
                        <Select value={type} onValueChange={setType} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Truck">Truck</SelectItem>
                                <SelectItem value="Van">Van</SelectItem>
                                <SelectItem value="Container">Container</SelectItem>
                                <SelectItem value="Pickup">Pickup</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity (kg)</Label>
                        <Input
                            id="capacity"
                            type="number"
                            placeholder="e.g. 5000"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            required
                            min="1"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createVehicle.isPending}>
                            {createVehicle.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Vehicle
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
