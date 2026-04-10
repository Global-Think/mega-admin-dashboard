import { LoaderCircle, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export function AppShellLoading({
  page,
}: {
  page: 'overview' | 'launch' | 'projects' | 'builds' | 'board';
}) {
  if (page !== 'board') {
    return null;
  }

  return (
    <div className="space-y-8 lg:space-y-10 pt-14 lg:pt-0">
      <Tabs value="fe" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Project tasks</h1>
            <p className="text-sm text-muted-foreground">
              Switch between frontend and backend workstreams, keep more tasks visible, and focus on one lane at a time.
            </p>
          </div>
          <TabsList className="w-full justify-start lg:w-auto">
            <TabsTrigger value="fe">Frontend Tasks</TabsTrigger>
            <TabsTrigger value="be">Backend Tasks</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="fe">
          <section>
            <Card className="rounded-[1.75rem] border shadow-none">
              <CardHeader className="flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">Frontend tasks</CardTitle>
                  <Badge className="px-3 py-1 text-sm">...</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" disabled>
                    <PlusCircle className="h-4 w-4" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex min-h-[360px] items-center justify-center rounded-[1.5rem] border border-dashed bg-muted/10 px-6">
                  <div className="inline-flex items-center gap-3 rounded-full border bg-background/90 px-5 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>Opening board...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
