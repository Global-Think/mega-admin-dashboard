'use client';

import { useActionState, useEffect, useState } from 'react';

import { createProjectAction, type CreateProjectActionState } from '@/components/dashboard/actions';
import { NewProjectPanel } from '@/components/dashboard/new-project-panel';
import type { FrameworkOption } from '@/components/dashboard/types';
import type { ProjectConfig } from '@/types/project';

const frameworkOptions: FrameworkOption[] = [
  { value: 'vue3', label: 'Vue 3', description: 'Vite, Vue Router, Pinia' },
  { value: 'nextjs', label: 'Next.js', description: 'App Router, Tailwind, Turbopack' },
  { value: 'angular', label: 'Angular', description: 'Strict mode, routing, SCSS' },
];

const consoleStageNames = [
  'Booting launch pipeline',
  'Preparing workspace',
  'Provisioning private repository',
  'Syncing access and integrations',
  'Finalizing board setup',
];

const initialCreateProjectActionState: CreateProjectActionState = {
  errors: {},
  result: null,
  submittedProjectName: '',
};

export function LaunchProjectClient() {
  const [form, setForm] = useState<ProjectConfig>({
    projectName: '',
    clientName: '',
    framework: 'nextjs',
    teamMembers: [],
  });
  const [teamInput, setTeamInput] = useState('');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [runStarted, setRunStarted] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createProjectAction,
    initialCreateProjectActionState
  );
  const normalizedProjectName = form.projectName.trim();
  const normalizedClientName = form.clientName.trim();
  const normalizedTeamInput = teamInput
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const isProjectNameValid = /^[a-z0-9-]+$/.test(normalizedProjectName);
  const areCollaboratorsValid = normalizedTeamInput.every((handle) =>
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37})$/.test(handle.replace(/^@/, ''))
  );
  const canSubmit = Boolean(normalizedProjectName && normalizedClientName && isProjectNameValid && areCollaboratorsValid);
  const shouldHidePreviousResult = runStarted && isPending;

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveStepIndex((current) => (current + 1) % consoleStageNames.length);
    }, 1250);

    return () => window.clearInterval(intervalId);
  }, [isPending]);

  return (
    <NewProjectPanel
      action={formAction}
      form={form}
      teamInput={teamInput}
      errors={state.errors}
      pending={isPending}
      createResult={shouldHidePreviousResult ? null : state.result}
      submittedProjectName={shouldHidePreviousResult ? '' : state.submittedProjectName}
      activeStep={isPending ? consoleStageNames[activeStepIndex] ?? consoleStageNames[0] : null}
      activeStepIndex={isPending ? activeStepIndex : -1}
      progressSteps={consoleStageNames}
      canSubmit={canSubmit}
      onSubmitStart={() => {
        setRunStarted(true);
        setActiveStepIndex(0);
      }}
      onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
      onFrameworkChange={(value) => setForm((current) => ({ ...current, framework: value }))}
      onTeamInputChange={setTeamInput}
      frameworkOptions={frameworkOptions}
    />
  );
}
