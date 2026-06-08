export const USERS = ['George', 'Arianne', 'Jep'] as const;
export type User = (typeof USERS)[number];

export const KV_KEY = 'webflow:activeUser';

export function isUser(value: unknown): value is User {
  return typeof value === 'string' && USERS.includes(value as User);
}
