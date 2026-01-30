import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background dark">
            <AdminSidebar />

            {/* Main Content Area - offset by sidebar width */}
            <div className="lg:pl-56 transition-all duration-300">
                <main className="min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}
