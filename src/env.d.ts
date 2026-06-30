/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly SLACK_BOT_TOKEN?: string;
  readonly CRON_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
