'use client';

import Link from 'next/link';
import { CheckCircle2, Clock3, FolderKanban, GitFork, PlusCircle } from 'lucide-react';
import { useFormStatus } from 'react-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FrameworkIcon } from '@/components/ui/FrameworkIcon';
import { HoverPrefetchLink } from '@/components/ui/HoverPrefetchLink';
import { Input } from '@/components/ui/Input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { cn } from '@/lib/utils';
import type { CreateProjectResult, FrameworkType, JenkinsWebhookConfig, ProjectConfig } from '@/types/project';
import { Field } from './field';
import type { CreateMode, FormErrors, FrameworkOption, LegacyBoardErrors } from './types';

export function NewProjectPanel({
  mode,
  onModeChange,
  projectAction,
  legacyAction,
  projectForm,
  legacyTitle,
  teamInput,
  projectErrors,
  legacyErrors,
  projectPending,
  legacyPending,
  createResult,
  boardResult,
  submittedProjectName,
  activeStep,
  activeStepIndex,
  progressSteps,
  canSubmitProject,
  canSubmitLegacy,
  onProjectSubmitStart,
  onProjectChange,
  onFrameworkChange,
  onTeamInputChange,
  onLegacyTitleChange,
  frameworkOptions,
}: {
  mode: CreateMode;
  onModeChange: (mode: CreateMode) => void;
  projectAction: (formData: FormData) => void;
  legacyAction: (formData: FormData) => void;
  projectForm: ProjectConfig;
  legacyTitle: string;
  teamInput: string;
  projectErrors: FormErrors;
  legacyErrors: LegacyBoardErrors;
  projectPending: boolean;
  legacyPending: boolean;
  createResult: CreateProjectResult | null;
  boardResult: { success: boolean; boardSlug?: string; error?: string } | null;
  submittedProjectName: string;
  activeStep: string | null;
  activeStepIndex: number;
  progressSteps: string[];
  canSubmitProject: boolean;
  canSubmitLegacy: boolean;
  onProjectSubmitStart: () => void;
  onProjectChange: (field: 'projectName' | 'clientName', value: string) => void;
  onFrameworkChange: (value: FrameworkType) => void;
  onTeamInputChange: (value: string) => void;
  onLegacyTitleChange: (value: string) => void;
  frameworkOptions: FrameworkOption[];
}) {
  const showExecutionFeed = projectPending || createResult != null;
  const currentDescription =
    mode === 'project'
      ? 'Create a repo, scaffold the app, and seed the board in one flow.'
      : 'Create a board only for inherited or external projects without provisioning a repo.';

  return (
    <section id="launch" className="space-y-6">
      <Card className="rounded-[2rem] border shadow-none">
        <CardHeader className="space-y-3 pb-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            <PlusCircle className="h-3.5 w-3.5" />
            Create Workspace
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl md:text-[2rem]">Create a project workspace.</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">{currentDescription}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium">Workspace type</p>
            <RadioGroup
              value={mode}
              onValueChange={(value) => onModeChange(value as CreateMode)}
              className="grid gap-1 rounded-[1.6rem] border border-border/70 bg-gradient-to-b from-muted/40 to-muted/20 p-1.5 lg:grid-cols-2"
              disabled={projectPending || legacyPending}
            >
              <ModeCard
                id="workspace-project"
                value="project"
                checked={mode === 'project'}
                icon={<GitFork className="h-4 w-4" />}
                title="Provisioned project"
                description="Creates the repo, scaffold, collaborators, and board."
              />
              <ModeCard
                id="workspace-legacy"
                value="legacy"
                checked={mode === 'legacy'}
                icon={<FolderKanban className="h-4 w-4" />}
                title="Legacy board"
                description="Creates only a Kanban board for an existing external or inherited project."
              />
            </RadioGroup>
          </div>

          {mode === 'project' ? (
            <form className="space-y-6" action={projectAction} onSubmit={onProjectSubmitStart}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Project Name" error={projectErrors.projectName}>
                  <Input
                    id="projectName"
                    name="projectName"
                    value={projectForm.projectName}
                    onChange={(event) => onProjectChange('projectName', event.target.value)}
                    placeholder="acme-dashboard"
                    disabled={projectPending}
                  />
                </Field>

                <Field label="Client Name" error={projectErrors.clientName}>
                  <Input
                    id="clientName"
                    name="clientName"
                    value={projectForm.clientName}
                    onChange={(event) => onProjectChange('clientName', event.target.value)}
                    placeholder="Acme Corp"
                    disabled={projectPending}
                  />
                </Field>
              </div>

              <Field label="Framework" error={projectErrors.framework}>
                <input type="hidden" name="framework" value={projectForm.framework} />
                <RadioGroup
                  value={projectForm.framework}
                  onValueChange={(value) => onFrameworkChange(value as FrameworkType)}
                  className="grid gap-3 lg:grid-cols-3"
                  disabled={projectPending}
                >
                  {frameworkOptions.map((option) => {
                    const checked = projectForm.framework === option.value;

                    return (
                      <label
                        key={option.value}
                        htmlFor={`framework-${option.value}`}
                        className={cn(
                          'cursor-pointer rounded-[1.5rem] p-[1px] transition-all',
                          checked ? 'bg-primary' : 'bg-border/60 hover:bg-border'
                        )}
                      >
                        <div
                          className={cn(
                            'flex items-start gap-3 rounded-[calc(1.5rem-1px)] px-4 py-4 transition-colors',
                            checked ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted/20'
                          )}
                        >
                          <RadioGroupItem
                            id={`framework-${option.value}`}
                            value={option.value}
                            className={cn(
                              'mt-1 h-4 w-4 border-current bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
                              checked ? 'border-primary-foreground text-primary-foreground' : 'text-muted-foreground'
                            )}
                          />
                          <div className="space-y-2.5">
                            <div
                              className={cn(
                                'flex h-11 w-11 items-center justify-center rounded-2xl transition-colors',
                                checked ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-muted text-foreground'
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
                              <p
                                className={cn(
                                  'mt-1 text-sm leading-5',
                                  checked ? 'text-primary-foreground/72' : 'text-muted-foreground'
                                )}
                              >
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

              <Field label="GitHub Collaborators" error={projectErrors.teamMembers}>
                <Input
                  id="teamMembers"
                  name="teamMembers"
                  value={teamInput}
                  onChange={(event) => onTeamInputChange(event.target.value)}
                  placeholder="durantula1, teammate-dev"
                  disabled={projectPending}
                />
                <p className="text-sm leading-5 text-muted-foreground">
                  Comma-separated GitHub usernames. New repositories are created as private, and access is limited to the owner plus invited collaborators.
                </p>
              </Field>

              <CreateProjectSubmitButton disabled={!canSubmitProject} />
            </form>
          ) : (
            <form className="space-y-6" action={legacyAction}>
              <Field label="Board Title" error={legacyErrors.title}>
                <Input
                  id="legacy-board-title"
                  name="title"
                  value={legacyTitle}
                  onChange={(event) => onLegacyTitleChange(event.target.value)}
                  placeholder="Baby chef"
                  disabled={legacyPending}
                />
              </Field>

              <p className="text-sm text-muted-foreground">
                The board URL will be generated automatically from the title.
              </p>

              <CreateLegacySubmitButton disabled={!canSubmitLegacy} />
            </form>
          )}
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
            {projectPending && activeStep ? (
              <LiveConsoleCard
                stepIndex={activeStepIndex}
                totalSteps={progressSteps.length}
                steps={progressSteps}
              />
            ) : null}

            {createResult?.success ? (
              <div className="space-y-4">
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
                      <HoverPrefetchLink href={`/projects/${submittedProjectName}`}>Open Board</HoverPrefetchLink>
                    </Button>
                  </div>
                </Alert>

                {createResult.jenkinsWebhook ? <JenkinsWebhookCard webhook={createResult.jenkinsWebhook} /> : null}
              </div>
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

      {boardResult ? (
        <Card className="rounded-[2rem] border shadow-none">
          <CardContent className="space-y-5 pt-6">
            {boardResult.success ? (
              <Alert variant="success">
                <AlertTitle>Board created successfully</AlertTitle>
                <AlertDescription className="text-emerald-800">
                  The legacy board is ready with default frontend and backend columns.
                </AlertDescription>
                {boardResult.boardSlug ? (
                  <div className="mt-4">
                    <Button asChild>
                      <Link href={`/projects/${boardResult.boardSlug}`}>Open Board</Link>
                    </Button>
                  </div>
                ) : null}
              </Alert>
            ) : (
              <Alert variant="error">
                <AlertTitle>Board creation failed</AlertTitle>
                <AlertDescription className="text-red-700">
                  {boardResult.error ?? 'Could not create board.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

function ModeCard({
  id,
  value,
  checked,
  icon,
  title,
  description,
}: {
  id: string;
  value: CreateMode;
  checked: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'cursor-pointer rounded-[1.25rem] transition-all duration-200',
        checked ? 'bg-background shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_0_0_1px_rgba(15,23,42,0.08)]' : 'hover:bg-background/50'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 rounded-[1.25rem] border px-4 py-3 transition-all duration-200',
          checked
            ? 'border-foreground/10 bg-background text-foreground ring-1 ring-foreground/8'
            : 'border-transparent bg-transparent text-muted-foreground'
        )}
      >
        <RadioGroupItem
          id={id}
          value={value}
          className={cn(
            'h-4 w-4 border-current bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
            checked ? 'text-foreground' : 'text-muted-foreground/80'
          )}
        />
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200',
            checked
              ? 'bg-foreground text-background shadow-[0_8px_20px_rgba(15,23,42,0.18)]'
              : 'bg-background/80 text-foreground'
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className={cn('text-sm font-semibold transition-colors', checked ? 'text-foreground' : 'text-foreground/80')}>
            {title}
          </p>
          <p
            className={cn(
              'mt-0.5 text-sm leading-5 transition-colors',
              checked ? 'text-muted-foreground' : 'text-muted-foreground/90'
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </label>
  );
}

function JenkinsWebhookCard({ webhook }: { webhook: JenkinsWebhookConfig }) {
  return (
    <div className="rounded-[1.5rem] border bg-muted/20 p-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold">Jenkins Hook Configuration</p>
        <p className="text-sm text-muted-foreground">
          {webhook.status === 'registered'
            ? 'This webhook was created during provisioning and can be reused in Jenkins or GitHub checks.'
            : webhook.reason ?? 'Webhook details are available, but registration was skipped.'}
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <ConfigStat label="Status" value={webhook.status === 'registered' ? 'Registered' : 'Skipped'} />
        <ConfigStat label="Events" value={webhook.events.join(', ')} />
        <ConfigStat label="Content Type" value={webhook.contentType} />
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Webhook URL</p>
        <div className="overflow-x-auto rounded-[1rem] border bg-background px-4 py-3 font-mono text-sm">
          {webhook.url}
        </div>
      </div>
    </div>
  );
}

function ConfigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border bg-background px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
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

function CreateLegacySubmitButton({ disabled }: { disabled: boolean }) {
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
          Creating board
        </>
      ) : (
        <>
          <FolderKanban className="h-4 w-4" />
          Create Board
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
                          <span className="h-2 w-2 rounded-full bg-amber-300" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-zinc-600" />
                        )}
                        <span>{item}</span>
                      </div>
                      {index < steps.length - 1 ? <span className="text-zinc-600">/</span> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
