import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageSpinnerLoadingState } from '@/components/ui/PageSpinnerLoadingState';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProjectBoardLoadingState() {
  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-52" />
            <Badge variant="secondary" className="px-3 py-1">
              Loading board
            </Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Preparing the project board shell, tabs, and task lanes without assuming how much work is inside.
          </p>
        </div>

        <div className="inline-flex w-full justify-start rounded-2xl border bg-muted/20 p-1 lg:w-auto">
          <span className="rounded-[1rem] border border-foreground/10 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm">
            Frontend Tasks
          </span>
          <span className="rounded-[1rem] border border-transparent px-4 py-2 text-sm font-medium text-muted-foreground">
            Backend Tasks
          </span>
        </div>
      </div>

      <section>
        <Card className="rounded-[1.75rem] border shadow-none">
          <CardHeader className="flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">Frontend tasks</CardTitle>
              <Badge className="px-3 py-1 text-sm">Loading</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Syncing board...</Badge>
              <Button variant="secondary" size="sm" disabled>
                Add Task
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <PageSpinnerLoadingState
              label="Loading board"
              title="Fetching project board..."
              description="Preparing columns, cards, and task lane state."
              minHeightClassName="min-h-[420px]"
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
