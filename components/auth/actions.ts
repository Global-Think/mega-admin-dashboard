'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getSafeNextPath } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export type AuthActionState = {
  error: string | null;
  feedback: string | null;
};

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const nextPath = getSafeNextPath(String(formData.get('nextPath') ?? ''));

  if (!email || !password) {
    return {
      error: 'Enter your email and password.',
      feedback: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message,
      feedback: null,
    };
  }

  redirect(nextPath);
}

export async function sendPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const nextPath = getSafeNextPath(String(formData.get('nextPath') ?? ''));

  if (!email) {
    return {
      error: 'Enter your email first so we know where to send the reset link.',
      feedback: null,
    };
  }

  const origin = await getRequestOrigin();
  if (!origin) {
    return {
      error: 'We could not determine the app URL for the reset link. Please try again.',
      feedback: null,
    };
  }

  const redirectUrl = new URL('/auth/callback', origin);
  redirectUrl.searchParams.set('next', `/reset-password?next=${encodeURIComponent(nextPath)}`);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl.toString(),
  });

  if (error) {
    return {
      error: error.message,
      feedback: null,
    };
  }

  return {
    error: null,
    feedback: 'We sent a password reset link. Open it in this browser and choose a new password.',
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const nextPath = getSafeNextPath(String(formData.get('nextPath') ?? ''));

  if (password.length < 8) {
    return {
      error: 'Password must be at least 8 characters long.',
      feedback: null,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: 'Passwords do not match.',
      feedback: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      error: error.message,
      feedback: null,
    };
  }

  redirect(nextPath);
}

async function getRequestOrigin(): Promise<string | null> {
  const headerStore = await headers();
  const origin = headerStore.get('origin');

  if (origin) {
    return origin;
  }

  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host');
  if (!host) {
    return null;
  }

  const protocol =
    headerStore.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return `${protocol}://${host}`;
}
