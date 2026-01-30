'use client';

import { useClientTrips } from '@/lib/queries/clientTrips';
import { useRealtimeTrips } from '@/lib/queries/realtime';
import { ShipmentCard } from '@/components/client/ShipmentCard';
import { RequestTripForm } from '@/components/client/RequestTripForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Loader2, MapPin, TrendingUp, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ClientDashboard() {
    const [userId, setUserId] = useState<string>('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const { data: trips, isLoading: tripsLoading, error } = useClientTrips(userId);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/?error=Please+login');
                return;
            }

            // Verify role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'client') {
                // Do not redirect, let the UI handle the access denied state
                setIsAuthorized(false);
                setAuthLoading(false);
                return;
            }

            setUserId(user.id);
            setIsAuthorized(true);
            setAuthLoading(false);
        };
        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        toast.success('Logged out successfully');
    };

    // Enable real-time trip updates
    useRealtimeTrips();

    if (authLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </main>
        );
    }

    if (!isAuthorized) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
                <Card className="max-w-md w-full border-destructive/50 bg-destructive/10">
                    <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
                        <div className="p-3 bg-destructive/20 rounded-full">
                            <LogOut className="h-8 w-8 text-destructive" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-destructive">Access Denied</h2>
                            <p className="text-sm text-muted-foreground">
                                This portal is restricted to Client accounts only.
                            </p>
                        </div>
                        <Button variant="outline" onClick={handleLogout} className="w-full">
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </main>
        );
    }

    if (tripsLoading) {
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
                {userId && <RequestTripForm clientId={userId} />}

                <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign Out">
                    <LogOut className="h-5 w-5 text-muted-foreground hover:text-destructive transition-colors" />
                </Button>
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
            {
                activeTrips.length > 0 && (
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
                )
            }

            {/* Pending Shipments */}
            {
                pendingTrips.length > 0 && (
                    <section>
                        <h2 className="text-sm font-semibold mb-3 text-yellow-400">Awaiting Assignment</h2>
                        <div className="space-y-3">
                            {pendingTrips.map((trip) => (
                                <ShipmentCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                    </section>
                )
            }

            {/* Completed Shipments */}
            {
                completedTrips.length > 0 && (
                    <section>
                        <h2 className="text-sm font-semibold mb-3 text-muted-foreground">History</h2>
                        <div className="space-y-3">
                            {completedTrips.map((trip) => (
                                <ShipmentCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                    </section>
                )
            }

            {/* Empty State */}
            {
                !trips?.length && (
                    <Card className="max-w-md mx-auto mt-12 bg-secondary/20 border-dashed">
                        <CardContent className="text-center py-12 space-y-4">
                            <div className="bg-background rounded-full p-4 w-fit mx-auto shadow-sm">
                                <Package className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold">No Shipments Found</h2>
                                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                    You haven't created any shipment requests yet. Start by creating a new one.
                                </p>
                            </div>
                            {userId && (
                                <div className="pt-2">
                                    <RequestTripForm clientId={userId} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            }
        </main >
    );
}
