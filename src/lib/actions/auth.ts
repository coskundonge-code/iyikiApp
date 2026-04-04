'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { mapUser } from '@/lib/supabase/mappers'
import { redirect } from 'next/navigation'
import type { User } from '@/types'

export interface AuthResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

/**
 * Sign in user with phone OTP
 */
export async function signInWithPhone(phone: string): Promise<AuthResponse<{ success: boolean }>> {
  try {
    if (!phone || phone.trim().length === 0) {
      return { data: null, error: 'Phone number is required' };
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: { success: true }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to sign in with phone';
    return { data: null, error: message };
  }
}

/**
 * Verify OTP token and complete authentication
 */
export async function verifyOtp(phone: string, token: string): Promise<AuthResponse<{ userId: string }>> {
  try {
    if (!phone || phone.trim().length === 0) {
      return { data: null, error: 'Phone number is required' };
    }

    if (!token || token.trim().length === 0) {
      return { data: null, error: 'Verification token is required' };
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data?.user?.id) {
      return { data: null, error: 'Authentication failed' };
    }

    return { data: { userId: data.user.id }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to verify OTP';
    return { data: null, error: message };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResponse<User>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user?.id) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      return { data: null, error: 'User not found' };
    }

    return { data: mapUser(userData), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get current user';
    return { data: null, error: message };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<AuthResponse<{ success: boolean }>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { data: null, error: error.message }
    }

    redirect('/login')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to sign out'
    return { data: null, error: message }
  }
}
