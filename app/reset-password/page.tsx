import { redirect } from 'next/navigation';

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { getSafeNextPath, isAllowedEmail } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAllowedEmail(user?.email)) {
    redirect('/login?error=invalid_link');
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <ResetPasswordForm nextPath={nextPath} />
    </div>
  );
}
