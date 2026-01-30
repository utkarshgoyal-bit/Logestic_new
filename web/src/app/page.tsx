import Link from "next/link";
import { Truck, ShieldCheck, User } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-50">
      <div className="max-w-4xl w-full text-center space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Lean Logistics Management
          </h1>
          <p className="text-zinc-400 text-lg">
            A unified tripartite system for Admins, Clients, and Drivers.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Portal Link */}
          <Link href="/admin" className="group p-8 border border-zinc-800 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 hover:border-blue-500 transition-all">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-semibold mb-2">Admin Portal</h2>
            <p className="text-sm text-zinc-500">Manage fleet, assign drivers, and audit financial data.</p>
          </Link>

          {/* Client Portal Link */}
          <Link href="/client" className="group p-8 border border-zinc-800 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 hover:border-accent transition-all">
            <User className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h2 className="text-xl font-semibold mb-2">Client Portal</h2>
            <p className="text-sm text-zinc-500">Request truck availability and monitor shipment milestones.</p>
          </Link>

          {/* Driver Portal Link */}
          <Link href="/driver" className="group p-8 border border-zinc-800 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 hover:border-green-500 transition-all">
            <Truck className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-semibold mb-2">Driver Portal</h2>
            <p className="text-sm text-zinc-500">Log manual milestones, fuel stops, and toll expenses.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}