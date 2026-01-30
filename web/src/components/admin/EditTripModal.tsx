'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea'; // Component missing, using native textarea
import { useUpdateTrip } from '@/lib/queries/trips';
import type { Trip, Profile } from '@/types/database';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditTripModalProps {
    trip: (Trip & { client?: Profile }) | null;
    onClose: () => void;
}

export function EditTripModal({ trip, onClose }: EditTripModalProps) {
    const [amount, setAmount] = useState<string>('');
    const [received, setReceived] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const updateTrip = useUpdateTrip();

    useEffect(() => {
        if (trip) {
            setAmount(trip.billed_amount?.toString() || '0');
            setReceived(trip.amount_received?.toString() || '0');
            setNotes(trip.notes || '');
        }
    }, [trip]);

    const handleSave = async () => {
        if (!trip) return;

        try {
            await updateTrip.mutateAsync({
                id: trip.id,
                updates: {
                    billed_amount: Number(amount),
                    amount_received: Number(received),
                    notes: notes
                }
            });
            toast.success("Trip details updated");
            onClose();
        } catch (error: any) {
            toast.error("Failed to update trip: " + error.message);
        }
    };

    const remaining = Math.max(0, Number(amount) - Number(received));

    return (
        <Dialog open={!!trip} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Request Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Invoice Amount (₹)</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="received">Received Amount (₹)</Label>
                            <Input
                                id="received"
                                type="number"
                                value={received}
                                onChange={(e) => setReceived(e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-md border border-secondary">
                        <span className="text-sm font-medium">Remaining Balance:</span>
                        <span className={`font-bold ${remaining > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            ₹{remaining.toLocaleString()}
                        </span>
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
