'use client';

import Link from 'next/link';
import { CheckCircle2, Clock3, GitFork, PlusCircle } from 'lucide-react';
import { useFormStatus } from 'react-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FrameworkIcon } from '@/components/ui/FrameworkIcon';
import { Input } from '@/components/ui/Input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { cn } from '@/lib/utils';
import type { CreateProjectResult, FrameworkType, ProjectConfig } from '@/types/project';
import { Field } from './field';
import type { FormErrors, FrameworkOption } from './types';

export function NewProjectPanel({
  action,
  form,
  teamInput,
  errors,
  pending,
  createResult,
  submittedProjectName,
  activeStep,
  activeStepIndex,
  progressSteps,
  canSubmit,
  onSubmitStart,
  onChange,
  onFrameworkChange,
  onTeamInputChange,
  frameworkOptions,
}: {
  action: (formData: FormData) => void;
  form: ProjectConfig;
  teamInput: string;
  errors: FormErrors;
  pending: boolean;
  createResult: CreateProjectResult | null;
  submittedProjectName: string;
  activeStep: string | null;
  activeStepIndex: number;
  progressSteps: string[];
  canSubmit: boolean;
  onSubmitStart: () => void;
  onChange: (field: 'projectName' | 'clientName', value: string) => void;
  onFrameworkChange: (value: FrameworkType) => void;
  onTeamInputChange: (value: string) => void;
  frameworkOptions: FrameworkOption[];
}) {
  const showExecutionFeed = pending || createResult != null;

  return (
    <section id="launch" className="space-y-6">
      <Card className="rounded-[2rem] border shadow-none">
        <CardHeader className="space-y-3 pb-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            <PlusCircle className="h-3.5 w-3.5" />
            Launch Project
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl md:text-[2rem]">Create repo, scaffold app, seed the board.</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">
              One clean intake form with automatic private repo setup and board provisioning.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" action={action} onSubmit={onSubmitStart}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Project Name" error={errors.projectName}>
                <Input
                  id="projectName"
                  name="projectName"
                  value={form.projectName}
                  onChange={(event) => onChange('projectName', event.target.value)}
                  placeholder="acme-dashboard"
                  disabled={pending}
                />
              </Field>

              <Field label="Client Name" error={errors.clientName}>
                <Input
                  id="clientName"
                  name="clientName"
                  value={form.clientName}
                  onChange={(event) => onChange('clientName', event.target.value)}
                  placeholder="Acme Corp"
                  disabled={pending}
                />
              </Field>
            </div>

            <Field label="Framework" error={errors.framework}>
              <input type="hidden" name="framework" value={form.framework} />
              <RadioGroup
                value={form.framework}
                onValueChange={(value) => onFrameworkChange(value as FrameworkType)}
                className="grid gap-3 lg:grid-cols-3"
                disabled={pending}
              >
                {frameworkOptions.map((option) => {
                  const checked = form.framework === option.value;

                  return (
                    <label
                      key={option.value}
                      htmlFor={`framework-${option.value}`}
                      className={cn(
                        'cursor-pointer rounded-[1.35rem] border p-3.5 transition-colors',
                        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem
                          id={`framework-${option.value}`}
                          value={option.value}
                          className={cn(
                            'mt-1 border-current',
                            checked ? 'text-primary-foreground border-primary-foreground' : 'text-primary'
                          )}
                        />
                        <div className="space-y-2.5">
                          <div
                            className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-xl border',
                              checked ? 'border-primary-foreground/20 bg-primary-foreground/10' : 'border-border bg-muted/50'
                            )}
                          >
                            <FrameworkIcon
                              framework={option.value}
                              className={cn(
                                checked ? 'text-primary-foreground' : 'text-foreground',
                                option.value === 'nextjs' ? 'h-5 w-5' : 'h-4 w-4'
                              )}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{option.label}</p>
                            <p className={cn('mt-1 text-sm leading-5', checked ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </Field>

            <Field label="GitHub Collaborators" error={errors.teamMembers}>
              <Input
                id="teamMembers"
                name="teamMembers"
                value={teamInput}
                onChange={(event) => onTeamInputChange(event.target.value)}
                placeholder="durantula1, teammate-dev"
                disabled={pending}
              />
              <p className="text-sm leading-5 text-muted-foreground">
                Comma-separated GitHub usernames. New repositories are created as private, and access is limited to the owner plus invited collaborators.
              </p>
            </Field>

            <CreateProjectSubmitButton disabled={!canSubmit} />
          </form>
        </CardContent>
      </Card>

      {showExecutionFeed ? (
        <Card className="rounded-[2rem] border shadow-none">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              Execution Feed
            </div>
            <CardTitle className="text-2xl">Live progress</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {pending && activeStep ? (
              <LiveConsoleCard
                stepIndex={activeStepIndex}
                totalSteps={progressSteps.length}
                steps={progressSteps}
              />
            ) : null}

            {createResult?.success ? (
              <Alert variant="success">
                <AlertTitle>Project created successfully</AlertTitle>
                <AlertDescription className="text-emerald-800">
                  Private repository, scaffold, collaborators, and Kanban record were created. Use the quick actions
                  below to jump into the repo or the board.
                </AlertDescription>
                <div className="mt-4 flex flex-wrap gap-3">
                  {createResult.repoUrl ? (
                    <Button asChild>
                      <Link href={createResult.repoUrl} target="_blank" rel="noreferrer">
                        Open Repository
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild variant="secondary">
                    <Link href={`/projects/${submittedProjectName}`}>Open Board</Link>
                  </Button>
                </div>
              </Alert>
            ) : null}

            {createResult && !createResult.success ? (
              <Alert variant="error">
                <AlertTitle>Project creation failed</AlertTitle>
                <AlertDescription className="text-red-700">
                  {createResult.error ?? 'Project creation failed.'}
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

function CreateProjectSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      className="w-full md:w-auto focus-visible:ring-0 focus-visible:ring-offset-0"
      disabled={pending || disabled}
    >
      {pending ? (
        <>
          <span className="loading-dot h-2.5 w-2.5 rounded-full bg-primary-foreground" />
          Initializing project
        </>
      ) : (
        <>
          <GitFork className="h-4 w-4" />
          Initialize Project
        </>
      )}
    </Button>
  );
}

function LiveConsoleCard({
  stepIndex,
  totalSteps,
  steps,
}: {
  stepIndex: number;
  totalSteps: number;
  steps: string[];
}) {
  const safeStepIndex = Math.max(0, stepIndex);
  const progress = `${Math.max(1, safeStepIndex + 1)}/${totalSteps}`;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="ml-2 font-mono text-xs uppercase tracking-[0.24em] text-zinc-400">
            project-factory
          </span>
        </div>
        <div className="font-mono text-xs text-zinc-500">stage {progress}</div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4 font-mono text-sm">
          <div className="space-y-4 text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">$</span>
              <span>launch --project bootstrap</span>
            </div>
            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-max items-center gap-3">
                {steps.map((item, index) => {
                  const isComplete = index < safeStepIndex;
                  const isActive = index === safeStepIndex;

                  return (
                    <div key={item} className="flex items-center gap-3">
                      <div
                        className={cn(
                          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
                          isActive
                            ? 'border-amber-300/30 bg-amber-300/10 text-zinc-100'
                            : isComplete
                              ? 'border-emerald-400/20 bg-emerald-400/10 text-zinc-300'
                              : 'border-white/10 bg-white/[0.03] text-zinc-500'
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : isActive ? (
                          <Clock3 className="h-3.5 w-3.5 animate-pulse text-amber-300" />
                        ) : (
                          <span className="text-zinc-600">&gt;</span>
                        )}
                        <span className="whitespace-nowrap text-xs">
                          {item.toLowerCase()}
                          {isActive ? '...' : isComplete ? ' complete' : ''}
                        </span>
                        {isActive ? (
                          <span className="inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-zinc-400/70" />
                        ) : null}
                      </div>
                      {index < steps.length - 1 ? <span className="text-zinc-700">/</span> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <ConsoleStat label="Mode" value="Private repo" />
          <ConsoleStat label="Access" value="Owner + collaborators" />
          <ConsoleStat label="Status" value="Running" />
        </div>
      </div>
    </div>
  );
}

function ConsoleStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-3 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      <p className="mt-2 text-sm text-zinc-100">{value}</p>
    </div>
  );
}
