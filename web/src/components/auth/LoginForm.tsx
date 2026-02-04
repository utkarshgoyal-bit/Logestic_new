'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { ClientAuthForm } from './ClientAuthForm';
// Tabs imports removed as they are no longer used

export function LoginForm() {
    const [mode, setMode] = useState<'client' | 'admin' | 'driver'>('client');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRedirect = async (userId: string) => {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (profile?.role === 'client') {
            router.push('/client');
        } else if (profile?.role === 'driver') {
            router.push('/driver');
        } else if (profile?.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/');
        }
    };

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
                setLoading(false);
                return;
            }

            if (data.user) {
                toast.success('Signed in successfully');
                await handleRedirect(data.user.id);
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
            console.error(err);
            setLoading(false);
        }
    };

    const performTestLogin = async (e: string, p: string) => {
        setEmail(e);
        setPassword(p);
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email: e, password: p });
        if (error) { toast.error('Test login failed: ' + error.message); setLoading(false); }
        else if (data.user) { toast.success('Signed in successfully'); await handleRedirect(data.user.id); }
    };
    const signInAsTestClient = () => performTestLogin('client@example.com', 'client123');
    const signInAsTestAdmin = () => performTestLogin('admin@example.com', 'password123');
    const signInAsTestDriver = () => performTestLogin('driver@example.com', 'password123');


    return (
        <Card className="w-full max-w-md mx-auto border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <KeyRound className="h-6 w-6 text-primary" />
                    {mode === 'client' ? 'Client Login' :
                        mode === 'admin' ? 'Admin Login' : 'Driver Login'}
                </CardTitle>
                <CardDescription>
                    {mode === 'client'
                        ? 'Enter your mobile number to access your dashboard'
                        : 'Enter your credentials to access the system'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {mode === 'client' ? (
                    <ClientAuthForm />
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Sign In
                        </Button>
                    </form>
                )}

                <div className="relative pt-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {mode === 'client' ? (
                        <>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" onClick={() => setMode('admin')} disabled={loading}>
                                    Login as Admin
                                </Button>
                                <Button variant="outline" onClick={() => setMode('driver')} disabled={loading}>
                                    Login as Driver
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Button variant="ghost" onClick={() => setMode('client')} className="w-full" disabled={loading}>
                            Back to Client Login
                        </Button>
                    )}
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-center text-muted-foreground mt-4">
                        <p className="mb-1">Dev Tools</p>
                        <div className="flex justify-center gap-2">
                            <button onClick={signInAsTestClient} className="hover:underline">Client</button>
                            <button onClick={signInAsTestAdmin} className="hover:underline">Admin</button>
                            <button onClick={signInAsTestDriver} className="hover:underline">Driver</button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
