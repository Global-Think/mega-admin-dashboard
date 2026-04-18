import { PageSpinnerLoadingState } from '@/components/ui/PageSpinnerLoadingState';

export default function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <PageSpinnerLoadingState
        label="Opening reset"
        title="Preparing password reset"
        description="Validating the recovery link and loading the reset form."
        minHeightClassName="min-h-[320px]"
      />
    </div>
  );
}
