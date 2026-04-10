import type { FrameworkType } from '@/types/project';

export type FormErrors = Partial<Record<'projectName' | 'clientName' | 'framework' | 'teamMembers', string>>;

export type FrameworkOption = {
  value: FrameworkType;
  label: string;
  description: string;
};
