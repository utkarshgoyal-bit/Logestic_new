'use client';

import { useTripMilestones } from '@/lib/queries/driverTrips';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Coffee, Fuel, Receipt, Package, Loader2, Clock } from 'lucide-react';
import type { MilestoneType } from '@/types/database';

interface MilestoneTimelineProps {
    tripId: string;
}

const milestoneConfig: Record<MilestoneType, { icon: React.ElementType; label: string; color: string }> = {
    pickup: { icon: Package, label: 'Pickup', color: 'text-accent' },
    break: { icon: Coffee, label: 'Break', color: 'text-orange-400' },
    fuel: { icon: Fuel, label: 'Fuel', color: 'text-blue-400' },
    toll: { icon: Receipt, label: 'Toll', color: 'text-yellow-400' },
    drop: { icon: MapPin, label: 'Drop', color: 'text-green-400' },
};

export function MilestoneTimeline({ tripId }: MilestoneTimelineProps) {
    const { data: milestones, isLoading, error } = useTripMilestones(tripId);

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardContent className="text-center py-8 text-destructive">
                    Failed to load milestones
                </CardContent>
            </Card>
        );
    }

    if (!milestones?.length) {
        return (
            <Card className="w-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Trip Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-6 text-muted-foreground text-sm">
                    No milestones recorded yet
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Trip Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                    {/* Milestones */}
                    <div className="space-y-4">
                        {milestones.map((milestone) => {
                            const config = milestoneConfig[milestone.type];
                            const Icon = config.icon;
                            const time = new Date(milestone.recorded_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <div key={milestone.id} className="relative pl-10">
                                    {/* Icon circle */}
                                    <div className={`absolute left-0 p-2 rounded-full bg-secondary border border-border ${config.color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm">{config.label}</span>
                                            <span className="text-xs text-muted-foreground">{time}</span>
                                        </div>

                                        {milestone.location_name && (
                                            <p className="text-sm text-muted-foreground">{milestone.location_name}</p>
                                        )}

                                        {/* Metadata */}
                                        {Object.keys(milestone.metadata).length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {milestone.metadata.fuel_cost !== undefined && (
                                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                                        ₹{milestone.metadata.fuel_cost}
                                                    </span>
                                                )}
                                                {milestone.metadata.liters !== undefined && (
                                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                                        {milestone.metadata.liters}L
                                                    </span>
                                                )}
                                                {milestone.metadata.toll_amount !== undefined && (
                                                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
                                                        ₹{milestone.metadata.toll_amount}
                                                    </span>
                                                )}
                                                {milestone.metadata.duration_mins !== undefined && (
                                                    <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
                                                        {milestone.metadata.duration_mins} mins
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
