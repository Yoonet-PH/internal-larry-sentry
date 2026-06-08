import { neon } from '@neondatabase/serverless';

export function getSql() {
  const url = import.meta.env.DATABASE_URL;
  if (!url) {
    throw new Error('Missing environment variable: DATABASE_URL');
  }
  return neon(url);
}
