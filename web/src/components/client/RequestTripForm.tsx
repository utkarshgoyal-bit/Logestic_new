'use client';

import { useState } from 'react';
import { useCreateTrip } from '@/lib/queries/clientTrips';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

export function RequestTripForm({ clientId }: { clientId: string }) {
    const [open, setOpen] = useState(false);
    const createTrip = useCreateTrip();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        await createTrip.mutateAsync({
            client_id: clientId,
            pickup_location: formData.get('pickup') as string,
            drop_location: formData.get('drop') as string,
            billed_amount: Number(formData.get('amount')),
            status: 'pending'
        });

        setOpen(false);
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
                        <Label htmlFor="amount">Billed Amount (Agreed Rate)</Label>
                        <Input id="amount" name="amount" type="number" placeholder="5000" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={createTrip.isPending}>
                        {createTrip.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
