'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight, Truck, User, Clock, Package, Coffee, Fuel, Receipt, CheckCircle } from 'lucide-react';
import { useClientTripMilestones } from '@/lib/queries/clientTrips';
import { useRealtimeMilestones } from '@/lib/queries/realtime';
import type { Trip, Profile, Vehicle, Milestone, MilestoneType } from '@/types/database';
import { useState } from 'react';
import { ChatInterface } from '@/components/shared/ChatInterface';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface ShipmentCardProps {
    trip: Trip & { driver: Profile | null; vehicle: Vehicle | null };
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    assigned: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    active: 'bg-accent/20 text-accent border-accent/30',
    completed: 'bg-green-500/20 text-green-300 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const milestoneIcons: Record<MilestoneType, React.ElementType> = {
    pickup: Package,
    break: Coffee,
    fuel: Fuel,
    toll: Receipt,
    drop: CheckCircle,
};

export function ShipmentCard({ trip }: ShipmentCardProps) {
    const { data: milestones = [] } = useClientTripMilestones(trip.id);
    const [chatOpen, setChatOpen] = useState(false);

    // Subscribe to real-time milestone updates
    useRealtimeMilestones(trip.id);

    const isActive = trip.status === 'active' || trip.status === 'assigned';

    return (
        <Card className={`border-l-4 ${isActive ? 'border-l-primary' : 'border-l-muted'} bg-card/80`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        Shipment
                    </CardTitle>
                    <Badge variant="outline" className={statusColors[trip.status]}>
                        {trip.status.toUpperCase()}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setChatOpen(true)}>
                        <MessageSquare className="h-4 w-4" />
                        <span className="sr-only">Chat</span>
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Route */}
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-accent shrink-0" />
                    <span className="truncate">{trip.pickup_location || 'TBD'}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{trip.drop_location || 'TBD'}</span>
                </div>

                {/* Driver & Vehicle */}
                {trip.driver && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{trip.driver.full_name}</span>
                        </div>
                        {trip.vehicle && (
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-xs">{trip.vehicle.registration_number}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Milestone Timeline (Live) */}
                {milestones.length > 0 && (
                    <div className="border-t border-border/50 pt-3">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Live Tracking
                            {isActive && (
                                <span className="h-2 w-2 rounded-full bg-accent animate-pulse ml-1" />
                            )}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {milestones.map((m) => {
                                const Icon = milestoneIcons[m.type];
                                const time = new Date(m.recorded_at).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                });
                                return (
                                    <div
                                        key={m.id}
                                        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50 text-xs"
                                    >
                                        <Icon className="h-3 w-3" />
                                        <span>{m.type}</span>
                                        <span className="text-muted-foreground">{time}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Billed Amount */}
                {trip.billed_amount > 0 && (
                    <div className="text-right">
                        <span className="text-lg font-bold text-primary">₹{trip.billed_amount.toLocaleString()}</span>
                    </div>
                )}
            </CardContent>

            <ChatInterface
                trip={trip}
                open={chatOpen}
                onClose={() => setChatOpen(false)}
            />
        </Card>
    );
}
