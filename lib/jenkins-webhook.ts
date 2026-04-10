function normalizeJenkinsBaseUrl(jenkinsUrl: string): string {
  const normalized = jenkinsUrl.trim().replace(/\/+$/, '');

  if (!normalized) {
    throw new Error('JENKINS_URL is not configured');
  }

  return normalized;
}

export function buildJenkinsWebhookUrl(jenkinsUrl: string, repoSlug: string): string {
  const baseUrl = normalizeJenkinsBaseUrl(jenkinsUrl);
  const token = encodeURIComponent(repoSlug.trim());
  return `${baseUrl}/github-webhook/?token=${token}`;
}
