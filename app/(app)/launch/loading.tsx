import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function LaunchLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
      <Card className="rounded-[2rem] border shadow-none">
        <CardHeader className="space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-[32rem] max-w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-28 rounded-2xl" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border shadow-none">
        <CardHeader className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </CardContent>
      </Card>
    </div>
  );
}
