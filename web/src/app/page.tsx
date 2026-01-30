import { LoginForm } from "@/components/auth/LoginForm";
import { Truck, ShieldCheck, User } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full bg-zinc-950 text-zinc-50">
      {/* Left Panel: Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center p-12 bg-zinc-900 border-r border-zinc-800">
        <div className="max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Lean Logistics</h1>
            </div>
            <h2 className="text-4xl font-bold tracking-tighter">
              Unified Management System
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              A complete tripartite solution connecting Admins, Clients, and Drivers in real-time.
              Optimize your fleet, track shipments, and manage operations seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800">
              <ShieldCheck className="w-6 h-6 text-indigo-400 mb-2" />
              <div className="font-semibold">Secure Admin</div>
              <div className="text-xs text-zinc-500">Full fleet control</div>
            </div>
            <div className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800">
              <User className="w-6 h-6 text-emerald-400 mb-2" />
              <div className="font-semibold">Client Portal</div>
              <div className="text-xs text-zinc-500">Real-time tracking</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold">Lean Logistics</h1>
            <p className="text-sm text-zinc-400">Sign in to continue</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}