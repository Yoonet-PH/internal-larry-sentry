/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly SLACK_WEBHOOK_URL?: string;
  readonly CRON_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
