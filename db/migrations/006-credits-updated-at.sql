alter table webflow_status
  add column if not exists credits_updated_at timestamptz;
