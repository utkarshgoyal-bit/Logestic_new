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
import { Truck, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface AddVehicleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddVehicleModal({ open, onOpenChange }: AddVehicleModalProps) {
    const [registration, setRegistration] = useState('');
    const [type, setType] = useState('');
    const [capacity, setCapacity] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [insuranceNo, setInsuranceNo] = useState('');
    const [insuranceExpiry, setInsuranceExpiry] = useState('');

    const createVehicle = useCreateVehicle();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createVehicle.mutateAsync({
                registration_number: registration,
                vehicle_type: type,
                capacity_kg: Number(capacity),
                model: model || undefined,
                year: year ? Number(year) : undefined,
                insurance_number: insuranceNo || undefined,
                insurance_expiry: insuranceExpiry || undefined,
            });
            toast.success('Vehicle added successfully');
            onOpenChange(false);
            // Reset
            setRegistration('');
            setType('');
            setCapacity('');
            setModel('');
            setYear('');
            setInsuranceNo('');
            setInsuranceExpiry('');
        } catch (error: any) {
            toast.error('Failed to add vehicle: ' + error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        Add New Vehicle
                    </DialogTitle>
                    <DialogDescription>
                        Register a new truck or vehicle with full compliance details.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="registration">Registration No. *</Label>
                            <Input
                                id="registration"
                                placeholder="KA-01-AB-1234"
                                value={registration}
                                onChange={(e) => setRegistration(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model">Model Name</Label>
                            <Input
                                id="model"
                                placeholder="e.g. Tata Ace Gold"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type *</Label>
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
                            <Label htmlFor="year">Year</Label>
                            <Input
                                id="year"
                                type="number"
                                placeholder="2024"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="font-mono"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity (kg) *</Label>
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

                    <div className="grid grid-cols-2 gap-4 bg-secondary/20 p-3 rounded-lg border border-border/50">
                        <div className="space-y-2">
                            <Label htmlFor="insurance" className="text-xs uppercase text-muted-foreground">Insurance No.</Label>
                            <Input
                                id="insurance"
                                placeholder="Policy Number"
                                value={insuranceNo}
                                onChange={(e) => setInsuranceNo(e.target.value)}
                                className="bg-background h-8"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiry" className="text-xs uppercase text-muted-foreground">Expiry Date</Label>
                            <Input
                                id="expiry"
                                type="date"
                                value={insuranceExpiry}
                                onChange={(e) => setInsuranceExpiry(e.target.value)}
                                className="bg-background h-8"
                            />
                        </div>
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
