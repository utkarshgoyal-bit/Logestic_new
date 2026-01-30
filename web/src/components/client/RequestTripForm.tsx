'use client';

import { useState } from 'react';
import { useCreateTrip } from '@/lib/queries/clientTrips';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function RequestTripForm({ clientId }: { clientId: string }) {
    const [open, setOpen] = useState(false);
    const createTrip = useCreateTrip();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const category = formData.get('category') as string;

        try {
            await createTrip.mutateAsync({
                pickup_location: formData.get('pickup') as string,
                drop_location: formData.get('drop') as string,
                billed_amount: 0,
                status: 'pending',
                notes: `Requested Vehicle: ${category}`
            });

            toast.success("Shipment request submitted successfully");
            setOpen(false);
        } catch (error: any) {
            console.error("Failed to create trip:", error);
            if (error.message?.includes('client role')) {
                toast.error("Account Error: Profile missing or role mismatch. Admin fix required.");
            } else {
                toast.error(error.message || "Failed to submit request");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <PlusCircle className="w-4 h-4" /> New Shipment Request
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Request New Shipment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="pickup">Pickup Location</Label>
                        <Input id="pickup" name="pickup" placeholder="e.g. Warehouse A, Mumbai" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="drop">Drop-off Location</Label>
                        <Input id="drop" name="drop" placeholder="e.g. Distribution Center, Pune" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Vehicle Category</Label>
                        <Select name="category" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Truck">Truck (Standard)</SelectItem>
                                <SelectItem value="Container">Container</SelectItem>
                                <SelectItem value="Trailer">Trailer</SelectItem>
                                <SelectItem value="Van">Van / LCV</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={createTrip.isPending}>
                        {createTrip.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
