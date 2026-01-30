'use client';

import { useClientTrips } from '@/lib/queries/clientTrips';
import { useRealtimeTrips } from '@/lib/queries/realtime';
import { ShipmentCard } from '@/components/client/ShipmentCard';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Loader2, MapPin, TrendingUp } from 'lucide-react';

export default function ClientDashboard() {
    const { data: trips, isLoading, error } = useClientTrips();

    // Enable real-time trip updates
    useRealtimeTrips();

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 dark bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-4 dark bg-background">
                <div className="text-destructive text-center">
                    <p className="text-lg font-medium">Unable to load shipments</p>
                    <p className="text-sm text-muted-foreground mt-1">Please check your connection</p>
                </div>
            </main>
        );
    }

    const activeTrips = trips?.filter(t => t.status === 'assigned' || t.status === 'active') || [];
    const pendingTrips = trips?.filter(t => t.status === 'pending') || [];
    const completedTrips = trips?.filter(t => t.status === 'completed') || [];

    return (
        <main className="min-h-screen bg-background p-4 space-y-6 dark">
            {/* Header */}
            <header className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">My Shipments</h1>
                        <p className="text-xs text-muted-foreground">Real-time tracking & history</p>
                    </div>
                </div>
                {activeTrips.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30">
                        <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-xs font-medium text-accent">{activeTrips.length} Active</span>
                    </div>
                )}
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="bg-card/50">
                    <CardContent className="p-3 text-center">
                        <MapPin className="h-5 w-5 mx-auto mb-1 text-accent" />
                        <p className="text-lg font-bold">{activeTrips.length}</p>
                        <p className="text-xs text-muted-foreground">In Transit</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50">
                    <CardContent className="p-3 text-center">
                        <Package className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
                        <p className="text-lg font-bold">{pendingTrips.length}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50">
                    <CardContent className="p-3 text-center">
                        <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-400" />
                        <p className="text-lg font-bold">{completedTrips.length}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Shipments */}
            {activeTrips.length > 0 && (
                <section>
                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        Active Shipments
                    </h2>
                    <div className="space-y-3">
                        {activeTrips.map((trip) => (
                            <ShipmentCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                </section>
            )}

            {/* Pending Shipments */}
            {pendingTrips.length > 0 && (
                <section>
                    <h2 className="text-sm font-semibold mb-3 text-yellow-400">Awaiting Assignment</h2>
                    <div className="space-y-3">
                        {pendingTrips.map((trip) => (
                            <ShipmentCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                </section>
            )}

            {/* Completed Shipments */}
            {completedTrips.length > 0 && (
                <section>
                    <h2 className="text-sm font-semibold mb-3 text-muted-foreground">History</h2>
                    <div className="space-y-3">
                        {completedTrips.map((trip) => (
                            <ShipmentCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {!trips?.length && (
                <Card className="max-w-sm mx-auto">
                    <CardContent className="text-center py-12">
                        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h2 className="text-xl font-bold mb-2">No Shipments Yet</h2>
                        <p className="text-muted-foreground text-sm">
                            Your shipment requests will appear here.
                        </p>
                    </CardContent>
                </Card>
            )}
        </main>
    );
}
