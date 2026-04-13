import type { FrameworkType } from '@/types/project';

export type FormErrors = Partial<Record<'projectName' | 'clientName' | 'framework' | 'teamMembers', string>>;
export type LegacyBoardErrors = Partial<Record<'title', string>>;
export type CreateMode = 'project' | 'legacy';

export type FrameworkOption = {
  value: FrameworkType;
  label: string;
  description: string;
};
