import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

function BoardLaneSkeleton() {
  return (
    <div className="space-y-3 rounded-[1.5rem] border bg-card p-4">
      <Skeleton className="h-5 w-28" />
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    </div>
  );
}

export default function ProjectBoardLoading() {
  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-64 rounded-2xl" />
      </div>

      <Card className="rounded-[2rem] border shadow-none">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-4">
          <BoardLaneSkeleton />
          <BoardLaneSkeleton />
          <BoardLaneSkeleton />
          <BoardLaneSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}
