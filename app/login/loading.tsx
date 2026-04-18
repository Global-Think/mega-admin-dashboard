import { PageSpinnerLoadingState } from '@/components/ui/PageSpinnerLoadingState';

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <PageSpinnerLoadingState
        label="Opening login"
        title="Preparing sign-in"
        description="Checking your session and loading the secure login form."
        minHeightClassName="min-h-[320px]"
      />
    </div>
  );
}
