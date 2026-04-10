import Link from 'next/link';
import { Compass, Home, SearchX } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-2xl rounded-[2.25rem] border shadow-none">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] border bg-muted/40">
            <SearchX className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl tracking-tight">404</CardTitle>
            <CardDescription className="mx-auto max-w-xl text-base leading-7">
              This page does not exist or the link points to a workspace that is no longer available.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border bg-muted/20 p-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Home className="h-4 w-4" />
                Return to dashboard
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Go back to the main overview and continue from the central operations dashboard.
              </p>
            </div>

            <div className="rounded-[1.5rem] border bg-muted/20 p-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Compass className="h-4 w-4" />
                Open project registry
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Browse the tracked projects list if you were trying to open a specific board or build.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/">Back to Dashboard</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/projects">Open Projects</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
