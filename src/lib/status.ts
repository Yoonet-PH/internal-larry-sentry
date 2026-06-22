export const USERS = ['Admin', 'Webbie', 'Designer', 'Developer'] as const;
export type User = (typeof USERS)[number];

export const CLAUDE_PLANS = ['max', 'api'] as const;
export type ClaudePlan = (typeof CLAUDE_PLANS)[number];

export const CLAUDE_PLAN_LABELS: Record<ClaudePlan, string> = {
  max: 'Claude Max',
  api: 'Claude API',
};

export function isUser(value: unknown): value is User {
  return typeof value === 'string' && USERS.includes(value as User);
}

export function isClaudePlan(value: unknown): value is ClaudePlan {
  return typeof value === 'string' && CLAUDE_PLANS.includes(value as ClaudePlan);
}

export function isCreditsPercent(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100;
}
