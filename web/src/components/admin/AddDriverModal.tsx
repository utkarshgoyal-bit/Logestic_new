'use client';

import { useState } from 'react';
import { useCreateDriver } from '@/lib/queries/vehicles'; // We will add this export next
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
import { User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddDriverModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddDriverModal({ open, onOpenChange }: AddDriverModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const createDriver = useCreateDriver();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createDriver.mutateAsync({
                full_name: name,
                phone: phone,
            });
            toast.success('Driver added successfully');
            onOpenChange(false);
            setName('');
            setPhone('');
        } catch (error: any) {
            toast.error('Failed to add driver: ' + error.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Add New Driver
                    </DialogTitle>
                    <DialogDescription>
                        Create a driver profile for assignment. (They won't have login access yet).
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Ramesh Kumar"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            placeholder="e.g. +91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createDriver.isPending}>
                            {createDriver.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Driver
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
