'use client';
// Force HMR update

import { useState } from 'react';
import { createDriverAction } from '@/actions/driver';
import { useQueryClient } from '@tanstack/react-query';
// import { useCreateDriver } from '@/lib/queries/vehicles'; // Not used anymore
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
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [license, setLicense] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    // We import the server action dynamically or at the top. 
    // Since it's 'use server', detailed imports work.
    // Ideally import { createDriverAction } from '@/actions/driver'; at top
    // I will add the import in a subsequent edit or assume I can rewrite the whole file, 
    // but the tool is replace_file_content with chunks.
    // I'll add the import in a separate chunk.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createDriverAction({
                full_name: name,
                phone: phone,
                email: email || undefined,
                age: age ? parseInt(age) : undefined,
                license_number: license || undefined,
                remarks: remarks || undefined
            });
            toast.success('Driver added successfully with default password "test123"');
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
            onOpenChange(false);
            // Reset
            setName('');
            setPhone('');
            setEmail('');
            setAge('');
            setLicense('');
            setRemarks('');
        } catch (error: any) {
            toast.error('Failed to add driver: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Add New Driver
                    </DialogTitle>
                    <DialogDescription>
                        Complete profile details for the new driver.
                        Default password will be set to: <strong>test123</strong>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                placeholder="Ramesh Kumar"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input
                                id="age"
                                type="number"
                                placeholder="35"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                placeholder="+91 98765 43210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Login Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="driver@logestic.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="license">Driving License No. *</Label>
                        <Input
                            id="license"
                            placeholder="DL-1420110012345"
                            value={license}
                            onChange={(e) => setLicense(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks / Notes</Label>
                        <Input
                            id="remarks"
                            placeholder="Experience, shift preference, etc."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Driver
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
