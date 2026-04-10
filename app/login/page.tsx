import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/auth/LoginForm';
import { getSafeNextPath, isAllowedEmail } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAllowedEmail(user?.email)) {
    redirect(nextPath);
  }

  const errorMap: Record<string, string> = {
    unauthorized: 'This email address does not have access to the system.',
    invalid_link: 'The authentication link is invalid or has expired.',
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <LoginForm
        nextPath={nextPath}
        initialError={params.error ? errorMap[params.error] ?? params.error : undefined}
      />
    </div>
  );
}
