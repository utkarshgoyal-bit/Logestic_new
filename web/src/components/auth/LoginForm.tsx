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

export function LoginForm() {
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

    const signInAsTestClient = async () => {
        await performTestLogin('client@example.com', 'client123');
    };

    const signInAsTestAdmin = async () => {
        await performTestLogin('admin@example.com', 'password123');
    };

    const signInAsTestDriver = async () => {
        await performTestLogin('driver@example.com', 'password123');
    };

    const performTestLogin = async (e: string, p: string) => {
        setEmail(e);
        setPassword(p);
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: e,
            password: p,
        });

        if (error) {
            toast.error('Test login failed: ' + error.message);
            setLoading(false);
        } else if (data.user) {
            toast.success('Signed in successfully');
            await handleRedirect(data.user.id);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <KeyRound className="h-6 w-6 text-primary" />
                    Sign In
                </CardTitle>
                <CardDescription>
                    Enter your credentials to access the logistics platform
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
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

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <Button
                        variant="outline"
                        className="w-full text-xs h-9 border-dashed border-accent/50 hover:bg-accent/10"
                        onClick={signInAsTestClient}
                        disabled={loading}
                    >
                        Test Client
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full text-xs h-9 border-dashed border-blue-500/50 hover:bg-blue-500/10"
                        onClick={signInAsTestAdmin}
                        disabled={loading}
                    >
                        Test Admin
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full text-xs h-9 border-dashed border-green-500/50 hover:bg-green-500/10"
                        onClick={signInAsTestDriver}
                        disabled={loading}
                    >
                        Test Driver
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
