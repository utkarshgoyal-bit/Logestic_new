'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, Lock, User, Phone, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

type AuthStep = 'PHONE' | 'OTP' | 'DETAILS';

export function ClientAuthForm() {
    const [step, setStep] = useState<AuthStep>('PHONE');
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isResetMode, setIsResetMode] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Send OTP for both Signup and Signin/Reset
            // Supabase handles user creation automatically if they don't exist
            const { error } = await supabase.auth.signInWithOtp({
                phone: phone,
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success("OTP sent to your phone");
                setStep('OTP');
            }
        } catch (error: any) {
            toast.error("Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone,
                token: otp,
                type: 'sms',
            });

            if (error) throw error;
            if (!data.user) throw new Error("Verification failed");

            // Check if profile exists to determine if it's a new user or reset
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            // If profile exists, we assume it's a password reset / login
            // If no profile, it's a first time setup
            if (profile) {
                setIsResetMode(true);
                // Pre-fill name if available
                if (profile.full_name) setFullName(profile.full_name);
            } else {
                setIsResetMode(false);
            }

            setStep('DETAILS');

        } catch (error: any) {
            toast.error(error.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authenticated user");

            // 1. Update Password
            if (password) {
                const { error: pwdError } = await supabase.auth.updateUser({
                    password: password
                });
                if (pwdError) throw pwdError;
            }

            // 2. Upsert Profile (Ensure role is client)
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    phone: phone, // ensure consistent phone
                    full_name: fullName || 'Client', // Default name
                    role: 'client',
                    is_active: true,
                    updated_at: new Date().toISOString(),
                });

            if (profileError) throw profileError;

            toast.success(isResetMode ? "Password reset successfully!" : "Account created successfully!");
            router.push('/client');

        } catch (error: any) {
            toast.error("Failed to update profile: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {step === 'PHONE' && (
                <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+91 9999999999"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Enter your number with country code. We'll send a one-time password.
                        </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                        Send OTP
                    </Button>
                </form>
            )}

            {step === 'OTP' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2">
                        <Label htmlFor="otp">Enter Verification Code</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="text-center text-lg tracking-widest"
                            maxLength={6}
                            required
                        />
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Sent to {phone}</span>
                            <button type="button" onClick={() => setStep('PHONE')} className="text-primary hover:underline">Change Number</button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        Verify & Continue
                    </Button>
                </form>
            )}

            {step === 'DETAILS' && (
                <form onSubmit={handleFinalize} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-secondary/20 p-4 rounded-lg border border-secondary mb-4">
                        <h3 className="font-medium text-sm flex items-center gap-2">
                            {isResetMode ? 'Reset Password' : 'Complete Setup'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isResetMode ? 'Set a new password for your account.' : 'Create a password to secure your client account.'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fullname">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="fullname"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="pl-9"
                                placeholder="Your Business Name"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="new-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-9"
                                placeholder="Min. 6 characters"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        {isResetMode ? 'Reset Password & Login' : 'Create Account'}
                    </Button>
                </form>
            )}
        </div>
    );
}
