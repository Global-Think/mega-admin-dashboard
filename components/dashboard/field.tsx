import { Label } from '@/components/ui/Label';

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-muted-foreground">{error}</p> : null}
    </div>
  );
}
