import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDuration(duration: number | null | undefined): string {
  if (!duration || duration <= 0) {
    return '00:00';
  }

  const totalSeconds = Math.floor(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function formatDurationWords(duration: number | null | undefined): string {
  if (!duration || duration <= 0) {
    return 'N/A';
  }

  const totalSeconds = Math.floor(duration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} hr`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }

  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} sec`);
  }

  return parts.join(' ');
}

export function formatRelativeTime(timestamp: number | string | null | undefined): string {
  if (!timestamp) {
    return 'Never';
  }

  const value = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  const diffMs = Date.now() - value;
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatRelativeCompact(
  timestamp: number | string | null | undefined,
  referenceTimestamp: number | string
): string {
  if (!timestamp) {
    return 'N/A';
  }

  const value = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  const reference =
    typeof referenceTimestamp === 'string'
      ? new Date(referenceTimestamp).getTime()
      : referenceTimestamp;
  const diffMs = Math.max(0, reference - value);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    const remainingMinutes = diffMinutes % 60;
    return remainingMinutes > 0 ? `${diffHours}h ${remainingMinutes}m` : `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;
  return remainingHours > 0 ? `${diffDays}d ${remainingHours}h` : `${diffDays}d`;
}

export function formatDateTime(timestamp: number | string | null | undefined): string {
  if (!timestamp) {
    return 'N/A';
  }

  const value = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);

  if (Number.isNaN(value.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value);
}

export function getInitials(email?: string | null): string {
  if (!email) {
    return '??';
  }

  const base = email.split('@')[0] ?? email;
  const segments = base.split(/[._-]/).filter(Boolean);
  const initials = segments.slice(0, 2).map((segment) => segment[0]?.toUpperCase() ?? '');

  return initials.join('') || base.slice(0, 2).toUpperCase();
}
