export const USERS = ['Admin', 'Webbie', 'Designer', 'Developer'] as const;
export type User = (typeof USERS)[number];

export const CLAUDE_PLANS = ['max', 'api'] as const;
export type ClaudePlan = (typeof CLAUDE_PLANS)[number];

export const CLAUDE_PLAN_LABELS: Record<ClaudePlan, string> = {
  max: 'Claude Max',
  api: 'Claude API',
};

const REMAINING_CREDITS_PATTERN = /^\d+(\.\d{1,2})?$/;
const LEGACY_REMAINING_CREDITS_PATTERN = /^\d{1,3}(,\d{3})*$/;

export function isUser(value: unknown): value is User {
  return typeof value === 'string' && USERS.includes(value as User);
}

export function isClaudePlan(value: unknown): value is ClaudePlan {
  return typeof value === 'string' && CLAUDE_PLANS.includes(value as ClaudePlan);
}

export function isRemainingCredits(value: unknown): value is string {
  const normalized = normalizeRemainingCredits(value);
  return normalized !== null;
}

function stripCreditsInput(value: string): string {
  return value.trim().replace(/^(?:US\$|\$)\s*/i, '');
}

function formatCreditsAmount(amount: number): string | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  return amount.toFixed(2);
}

export function normalizeRemainingCredits(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = stripCreditsInput(value);
    if (!trimmed) return null;
    if (REMAINING_CREDITS_PATTERN.test(trimmed)) {
      return formatCreditsAmount(parseFloat(trimmed));
    }
    if (LEGACY_REMAINING_CREDITS_PATTERN.test(trimmed)) {
      const legacyAmount = Number(trimmed.replace(/,/g, '')) / 1000;
      return formatCreditsAmount(legacyAmount);
    }
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return formatCreditsAmount(value);
  }

  return null;
}

export function formatRemainingCreditsDisplay(value: string | null): string | null {
  const normalized = normalizeRemainingCredits(value);
  if (normalized === null) return null;
  return `US$${normalized}`;
}
