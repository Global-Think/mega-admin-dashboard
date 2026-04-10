'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';

export function SignOutButton({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSignOut = async () => {
    setError(null);

    try {
      const response = await fetch('/auth/signout', {
        method: 'POST',
      });
      const payload = (await response.json()) as { success?: boolean; redirectTo?: string };

      if (!response.ok || !payload.success || !payload.redirectTo) {
        throw new Error('Could not sign out.');
      }

      startTransition(() => {
        router.replace(payload.redirectTo ?? '/login');
        router.refresh();
      });
    } catch {
      setError('Sign out failed.');
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        className={collapsed ? 'w-full justify-center px-2 py-2' : 'w-full justify-start py-2'}
        onClick={handleSignOut}
        disabled={isPending}
        title={collapsed ? 'Sign out' : undefined}
      >
        <LogOut className="h-4 w-4" />
        {!collapsed ? (isPending ? 'Signing out...' : 'Sign out') : null}
      </Button>
      {!collapsed && error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
