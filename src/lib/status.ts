export const USERS = ['Admin', 'Webbie', 'Designer', 'Developer'] as const;
export type User = (typeof USERS)[number];

export const CLAUDE_PLANS = ['max', 'api'] as const;
export type ClaudePlan = (typeof CLAUDE_PLANS)[number];

export const CLAUDE_PLAN_LABELS: Record<ClaudePlan, string> = {
  max: 'Claude Max',
  api: 'Claude API',
};

const REMAINING_CREDITS_PATTERN = /^\d{1,3}(,\d{3})*$/;

export function isUser(value: unknown): value is User {
  return typeof value === 'string' && USERS.includes(value as User);
}

export function isClaudePlan(value: unknown): value is ClaudePlan {
  return typeof value === 'string' && CLAUDE_PLANS.includes(value as ClaudePlan);
}

export function isRemainingCredits(value: unknown): value is string {
  return typeof value === 'string' && REMAINING_CREDITS_PATTERN.test(value.trim());
}

export function normalizeRemainingCredits(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (REMAINING_CREDITS_PATTERN.test(trimmed)) return trimmed;
    if (/^\d+$/.test(trimmed)) {
      return Number(trimmed).toLocaleString('en-US');
    }
    return null;
  }

  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
    return value.toLocaleString('en-US');
  }

  return null;
}
