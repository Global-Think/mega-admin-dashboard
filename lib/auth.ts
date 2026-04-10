const configuredAllowedEmails = (process.env.AUTH_ALLOWED_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const allowedEmailSet = new Set(configuredAllowedEmails);

export function isAllowedEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  if (allowedEmailSet.size === 0) {
    return true;
  }

  return allowedEmailSet.has(email.trim().toLowerCase());
}

export function getSafeNextPath(value?: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  return value;
}
