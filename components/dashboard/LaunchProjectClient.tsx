'use client';

import { useActionState, useEffect, useState } from 'react';

import {
  createLegacyBoardAction,
  createProjectAction,
  type CreateBoardActionState,
  type CreateProjectActionState,
} from '@/components/dashboard/actions';
import { NewProjectPanel } from '@/components/dashboard/new-project-panel';
import type { CreateMode, FrameworkOption } from '@/components/dashboard/types';
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

const initialCreateBoardActionState: CreateBoardActionState = {
  errors: {},
  result: null,
  submittedBoardSlug: '',
};

export function LaunchProjectClient() {
  const [mode, setMode] = useState<CreateMode>('project');
  const [form, setForm] = useState<ProjectConfig>({
    projectName: '',
    clientName: '',
    framework: 'nextjs',
    teamMembers: [],
  });
  const [teamInput, setTeamInput] = useState('');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [runStarted, setRunStarted] = useState(false);
  const [legacyBoardForm, setLegacyBoardForm] = useState({
    title: '',
  });
  const [state, formAction, isPending] = useActionState(
    createProjectAction,
    initialCreateProjectActionState
  );
  const [boardState, boardFormAction, isBoardPending] = useActionState(
    createLegacyBoardAction,
    initialCreateBoardActionState
  );
  const normalizedProjectName = form.projectName.trim();
  const normalizedClientName = form.clientName.trim();
  const normalizedLegacyTitle = legacyBoardForm.title.trim();
  const normalizedTeamInput = teamInput
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const isProjectNameValid = /^[a-z0-9-]+$/.test(normalizedProjectName);
  const areCollaboratorsValid = normalizedTeamInput.every((handle) =>
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37})$/.test(handle.replace(/^@/, ''))
  );
  const canSubmitProject = Boolean(
    normalizedProjectName && normalizedClientName && isProjectNameValid && areCollaboratorsValid
  );
  const canSubmitLegacy = Boolean(normalizedLegacyTitle);
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
    <div className="space-y-8">
      <NewProjectPanel
        mode={mode}
        onModeChange={setMode}
        projectAction={formAction}
        legacyAction={boardFormAction}
        projectForm={form}
        legacyTitle={legacyBoardForm.title}
        teamInput={teamInput}
        projectErrors={state.errors}
        legacyErrors={boardState.errors}
        projectPending={isPending}
        legacyPending={isBoardPending}
        createResult={shouldHidePreviousResult ? null : state.result}
        boardResult={boardState.result}
        submittedProjectName={shouldHidePreviousResult ? '' : state.submittedProjectName}
        activeStep={isPending ? consoleStageNames[activeStepIndex] ?? consoleStageNames[0] : null}
        activeStepIndex={isPending ? activeStepIndex : -1}
        progressSteps={consoleStageNames}
        canSubmitProject={canSubmitProject}
        canSubmitLegacy={canSubmitLegacy}
        onProjectSubmitStart={() => {
          setRunStarted(true);
          setActiveStepIndex(0);
        }}
        onProjectChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
        onFrameworkChange={(value) => setForm((current) => ({ ...current, framework: value }))}
        onTeamInputChange={setTeamInput}
        onLegacyTitleChange={(value) => setLegacyBoardForm((current) => ({ ...current, title: value }))}
        frameworkOptions={frameworkOptions}
      />
    </div>
  );
}
