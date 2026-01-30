'use client';

import { FleetStatusTable } from '@/components/admin/FleetStatusTable';
import { BookingRequestQueue } from '@/components/admin/BookingRequestQueue';
import { Gauge, TrendingUp, Truck, ClipboardCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useRealtimeTrips, useRealtimeVehicles } from '@/lib/queries/realtime';

// Quick stats card component
function StatCard({
    icon: Icon,
    label,
    value,
    trend,
    trendUp,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
}) {
    return (
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            {label}
                        </p>
                        <p className="text-2xl font-bold">{value}</p>
                        {trend && (
                            <p className={`text-xs flex items-center gap-1 ${trendUp ? 'text-accent' : 'text-destructive'}`}>
                                <TrendingUp className={`h-3 w-3 ${!trendUp && 'rotate-180'}`} />
                                {trend}
                            </p>
                        )}
                    </div>
                    <div className="p-3 rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard() {
    // Enable real-time subscriptions for live updates
    useRealtimeTrips();
    useRealtimeVehicles();

    return (
        <main className="p-6 space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 shadow-lg shadow-primary/20">
                        <Gauge className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
                        <p className="text-sm text-muted-foreground">
                            Fleet Governance & Trip Assignment
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs font-medium text-accent">Live Updates</span>
                </div>
            </header>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Truck}
                    label="Active Vehicles"
                    value="3/4"
                    trend="+1 today"
                    trendUp
                />
                <StatCard
                    icon={ClipboardCheck}
                    label="Pending Requests"
                    value="1"
                />
                <StatCard
                    icon={Gauge}
                    label="Active Trips"
                    value="1"
                    trend="On schedule"
                    trendUp
                />
                <StatCard
                    icon={TrendingUp}
                    label="Today's Revenue"
                    value="₹80.5K"
                    trend="+12%"
                    trendUp
                />
            </div>

            {/* Split Pane Dashboard */}
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
                {/* Left: Fleet Status (8 columns) */}
                <section className="col-span-12 lg:col-span-8 overflow-hidden">
                    <FleetStatusTable />
                </section>

                {/* Right: Booking Queue (4 columns) */}
                <section className="col-span-12 lg:col-span-4 overflow-hidden">
                    <BookingRequestQueue />
                </section>
            </div>
        </main>
    );
}
