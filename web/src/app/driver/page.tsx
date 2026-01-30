'use client';

import { useState } from 'react';
import { useDriverActiveTrip } from '@/lib/queries/driverTrips';
import { DriverTripCard } from '@/components/driver/DriverTripCard';
import { MilestoneTimeline } from '@/components/driver/MilestoneTimeline';
import { MilestoneForm } from '@/components/driver/MilestoneForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Coffee, Fuel, Receipt, Loader2, CheckCircle } from 'lucide-react';

export default function DriverDashboard() {
    const { data: trip, isLoading, error } = useDriverActiveTrip();
    const [milestoneFormOpen, setMilestoneFormOpen] = useState(false);

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 dark">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-4 dark">
                <div className="text-destructive text-center">
                    <p className="text-lg font-medium">Unable to load trip data</p>
                    <p className="text-sm text-muted-foreground mt-1">Please check your connection and try again</p>
                </div>
            </main>
        );
    }

    if (!trip) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-4 dark bg-background">
                <Card className="max-w-sm w-full">
                    <CardContent className="text-center py-12">
                        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-accent opacity-50" />
                        <h2 className="text-xl font-bold mb-2">No Active Trips</h2>
                        <p className="text-muted-foreground text-sm">
                            You don't have any assigned trips at the moment.
                            Check back later or contact your dispatcher.
                        </p>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background p-4 space-y-4 dark">
            {/* Header */}
            <header className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">Driver Portal</h1>
                        <p className="text-xs text-muted-foreground">Trip Execution & Logging</p>
                    </div>
                </div>
            </header>

            {/* Active Trip Card */}
            <DriverTripCard trip={trip} />

            {/* Quick Action Buttons */}
            {trip.status === 'active' && (
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        variant="outline"
                        className="flex flex-col h-auto py-3 space-y-1"
                        onClick={() => setMilestoneFormOpen(true)}
                    >
                        <Coffee className="h-5 w-5" />
                        <span className="text-xs">Break</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex flex-col h-auto py-3 space-y-1"
                        onClick={() => setMilestoneFormOpen(true)}
                    >
                        <Fuel className="h-5 w-5" />
                        <span className="text-xs">Fuel</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex flex-col h-auto py-3 space-y-1"
                        onClick={() => setMilestoneFormOpen(true)}
                    >
                        <Receipt className="h-5 w-5" />
                        <span className="text-xs">Toll</span>
                    </Button>
                </div>
            )}

            {/* Milestone Timeline */}
            <MilestoneTimeline tripId={trip.id} />

            {/* Milestone Form Modal */}
            <MilestoneForm
                tripId={trip.id}
                open={milestoneFormOpen}
                onClose={() => setMilestoneFormOpen(false)}
            />
        </main>
    );
}
