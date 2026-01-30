'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateTrip } from '@/lib/queries/trips';
import type { Trip } from '@/types/database';
import { Loader2, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
    trip: Trip | null;
    onClose: () => void;
}

export function PaymentModal({ trip, onClose }: PaymentModalProps) {
    const [amount, setAmount] = useState<string>('');
    const [received, setReceived] = useState<string>('');
    const updateTrip = useUpdateTrip();

    useEffect(() => {
        if (trip) {
            setAmount(trip.billed_amount?.toString() || '0');
            setReceived(trip.amount_received?.toString() || '0');
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
                    status: 'active'
                }
            });
            toast.success("Payment details updated");
            onClose();
        } catch (error: any) {
            toast.error("Failed to update payment: " + error.message);
        }
    };

    const remaining = Math.max(0, Number(amount) - Number(received));

    return (
        <Dialog open={!!trip} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IndianRupee className="h-5 w-5 text-primary" />
                        Manage Payments
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="payment_amount">Invoice Amount (₹)</Label>
                            <Input
                                id="payment_amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment_received">Received Amount (₹)</Label>
                            <Input
                                id="payment_received"
                                type="number"
                                value={received}
                                onChange={(e) => setReceived(e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-secondary">
                        <span className="text-sm font-medium">Remaining Balance:</span>
                        <span className={`text-lg font-bold ${remaining > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            ₹{remaining.toLocaleString()}
                        </span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={updateTrip.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={updateTrip.isPending}>
                        {updateTrip.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Payments
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
