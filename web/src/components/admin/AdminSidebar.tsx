'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Gauge, Truck, ClipboardList, MapPin, Users, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
    { icon: Gauge, label: 'Dashboard', href: '/admin' },
    { icon: Truck, label: 'Fleet', href: '/admin/fleet' },
    { icon: ClipboardList, label: 'Requests', href: '/admin/requests' },
    { icon: MapPin, label: 'Trips', href: '/admin/trips' },
    { icon: Users, label: 'Drivers', href: '/admin/drivers' },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 lg:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
                    isCollapsed ? 'w-16' : 'w-56',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo / Brand */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
                    {!isCollapsed && (
                        <span className="text-sidebar-primary font-bold text-lg tracking-tight">
                            LeanLogistics
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden lg:flex shrink-0"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                                    isActive
                                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                    isCollapsed && 'justify-center px-0'
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon className={cn('shrink-0', isCollapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-sidebar-border">
                    {!isCollapsed && (
                        <p className="text-xs text-muted-foreground text-center">
                            Admin Portal v1.0
                        </p>
                    )}
                </div>
            </aside>
        </>
    );
}
