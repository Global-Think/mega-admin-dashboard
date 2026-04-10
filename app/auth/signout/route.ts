import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const response = NextResponse.json({
    success: true,
    redirectTo: new URL('/login', request.url).toString(),
  });

  return response;
}
