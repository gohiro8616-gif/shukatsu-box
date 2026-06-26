-- ShukatsuBox 初期スキーマ
-- RLS = Row Level Security（行レベルセキュリティ）: ログインユーザーが自分のデータだけにアクセスできる仕組み

-- 企業テーブル
create table companies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email_domain text,
  status text not null default '未応募',
  deadline timestamptz,
  memo text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table companies enable row level security;
create policy "ユーザーは自分の企業のみ閲覧可能" on companies for select using (auth.uid() = user_id);
create policy "ユーザーは自分の企業のみ作成可能" on companies for insert with check (auth.uid() = user_id);
create policy "ユーザーは自分の企業のみ更新可能" on companies for update using (auth.uid() = user_id);
create policy "ユーザーは自分の企業のみ削除可能" on companies for delete using (auth.uid() = user_id);

-- メールテーブル
create table emails (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company_id uuid references companies(id) on delete set null,
  gmail_id text not null,
  subject text not null,
  from_address text not null,
  from_name text,
  snippet text,
  received_at timestamptz not null,
  is_read boolean default false not null,
  ai_category text,
  detected_deadline timestamptz,
  gmail_link text,
  created_at timestamptz default now() not null
);

alter table emails enable row level security;
create policy "ユーザーは自分のメールのみ閲覧可能" on emails for select using (auth.uid() = user_id);
create policy "ユーザーは自分のメールのみ作成可能" on emails for insert with check (auth.uid() = user_id);
create policy "ユーザーは自分のメールのみ更新可能" on emails for update using (auth.uid() = user_id);
create policy "ユーザーは自分のメールのみ削除可能" on emails for delete using (auth.uid() = user_id);

create unique index emails_gmail_id_user_id on emails(gmail_id, user_id);

-- 選考タイムラインテーブル
create table timeline_events (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  status text not null,
  note text,
  occurred_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

alter table timeline_events enable row level security;
create policy "ユーザーは自分の企業のタイムラインのみ閲覧可能" on timeline_events
  for select using (
    exists (select 1 from companies where companies.id = timeline_events.company_id and companies.user_id = auth.uid())
  );
create policy "ユーザーは自分の企業のタイムラインのみ作成可能" on timeline_events
  for insert with check (
    exists (select 1 from companies where companies.id = timeline_events.company_id and companies.user_id = auth.uid())
  );

-- カスタムステータステーブル
create table custom_statuses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  color text not null default '#6B7280',
  sort_order integer not null default 0
);

alter table custom_statuses enable row level security;
create policy "ユーザーは自分のカスタムステータスのみ操作可能" on custom_statuses
  for all using (auth.uid() = user_id);

-- アラート設定テーブル
create table alert_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  days_before integer not null,
  enabled boolean default true not null
);

alter table alert_settings enable row level security;
create policy "ユーザーは自分のアラート設定のみ操作可能" on alert_settings
  for all using (auth.uid() = user_id);
