-- ============================================================
-- SportMed AI — Supabase Schema
-- 請在 Supabase Dashboard > SQL Editor 貼上並執行
-- ============================================================

-- 管理員表
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- 客戶表
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  created_at timestamptz default now()
);
create index if not exists clients_name_idx on clients(name);

-- 評估診斷記錄表
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  session_date date not null default current_date,
  session_number int not null default 1,
  input_text text not null,
  result_json jsonb,
  created_at timestamptz default now()
);

-- 反饋記錄表
create table if not exists feedbacks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  feedback_date date not null default current_date,
  feedback_text text not null,
  followup_result_json jsonb,
  created_at timestamptz default now()
);

-- Row Level Security (開放服務端存取)
alter table admins enable row level security;
alter table clients enable row level security;
alter table sessions enable row level security;
alter table feedbacks enable row level security;

create policy "service_all" on admins for all using (true);
create policy "service_all" on clients for all using (true);
create policy "service_all" on sessions for all using (true);
create policy "service_all" on feedbacks for all using (true);
