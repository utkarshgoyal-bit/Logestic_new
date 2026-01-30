'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea'; // Component missing, using native textarea
import { useUpdateTrip } from '@/lib/queries/trips';
import type { Trip, Profile } from '@/types/database';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface EditTripModalProps {
    trip: (Trip & { client?: Profile }) | null;
    onClose: () => void;
}

export function EditTripModal({ trip, onClose }: EditTripModalProps) {
    const [pickup, setPickup] = useState<string>('');
    const [drop, setDrop] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const updateTrip = useUpdateTrip();

    useEffect(() => {
        if (trip) {
            setPickup(trip.pickup_location || '');
            setDrop(trip.drop_location || '');
            setNotes(trip.notes || '');
        }
    }, [trip]);

    const handleSave = async () => {
        if (!trip) return;

        try {
            await updateTrip.mutateAsync({
                id: trip.id,
                updates: {
                    pickup_location: pickup,
                    drop_location: drop,
                    notes: notes
                }
            });
            toast.success("Trip details updated");
            onClose();
        } catch (error: any) {
            toast.error("Failed to update trip: " + error.message);
        }
    };

    return (
        <Dialog open={!!trip} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Trip Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="pickup">Pickup Location</Label>
                        <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="pickup"
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                                className="pl-9"
                                placeholder="Enter pickup address"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="drop">Drop Location</Label>
                        <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="drop"
                                value={drop}
                                onChange={(e) => setDrop(e.target.value)}
                                className="pl-9"
                                placeholder="Enter drop address"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes / Vehicle Details</Label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about vehicle requirements..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={updateTrip.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={updateTrip.isPending}>
                        {updateTrip.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
