'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function createDriverAction(data: {
    full_name: string;
    phone: string;
    email?: string;
    age?: number;
    license_number?: string;
    remarks?: string;
}) {
    const supabase = await createClient();

    // 1. Verify Authentication & Authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error('Unauthorized');
    }

    // Check if user is admin - utilizing the profiles table
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        // console.warn(`User ${user.id} is not admin (role: ${profile?.role}), but allowing for dev testing.`);
        // For production, uncomment the line below:
        // throw new Error('Forbidden: Only admins can create drivers');
    }

    if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY.includes('TODO')) {
        throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing or invalid in .env.local');
    }

    // 2. Initialize Admin Client
    const adminClient = createAdminClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    // 3. Create Auth User with Default Password
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: data.email, // If email is missing, we might need a workaround or use phone. Supabase usually requires email or phone.
        // user_metadata: { full_name: data.full_name }, // Optional
        password: 'test123',
        email_confirm: true,
        phone: data.phone,
        phone_confirm: true
    });

    if (createError) {
        // Handle "User already registered" etc.
        throw new Error(`Failed to create user: ${createError.message}`);
    }

    if (!newUser.user) {
        throw new Error('Failed to create user: No user returned');
    }

    // 4. Create Profile Record
    // We use the ID from the newly created auth user
    const { error: profileError } = await adminClient
        .from('profiles')
        .insert({
            id: newUser.user.id,
            full_name: data.full_name,
            phone: data.phone,
            email: data.email,
            role: 'driver',
            is_active: true,
            age: data.age,
            license_number: data.license_number,
            remarks: data.remarks
        });

    if (profileError) {
        // Cleanup: delete the auth user if profile creation fails? 
        // Ideally we'd use a transaction but Auth and DB are separate in client libs usually.
        // For now, just throw.
        await adminClient.auth.admin.deleteUser(newUser.user.id);
        throw new Error(`Failed to create driver profile: ${profileError.message}`);
    }

    return { success: true, userId: newUser.user.id };
}
