# BTC Solo Win Monitor (React + Netlify + Supabase)

## What this project does
- Public Landing page:
  - Check if a Bitcoin address is pending / approved / rejected / not found
  - Submit a request to add an address (manual approval required)
  - Miner stats feature exists as a disabled template (safe by default)

- Admin page:
  - Uses Supabase Auth (email + password)
  - Admins can view and manage request queues (pending / approved / rejected / all)
  - Admins can approve / reject requests

- Backend:
  - Netlify Functions for all reads/writes
  - Netlify Scheduled Function checks the latest Bitcoin block and records wins for approved addresses

## Local setup (Windows PowerShell)
1) Install Node.js 18+.
2) In this folder:

   npm install
   npm run dev

Open the dev URL shown in the terminal (usually http://localhost:5173).

Note: Netlify Functions will not run automatically in plain Vite dev. For full local Netlify emulation, install Netlify CLI:
  npm install -g netlify-cli
Then run:
  netlify dev

## Supabase setup (required)
1) Create a Supabase project.
2) Save:
   - Project URL
   - Anon key
   - Service role key (server-side only)

3) In Supabase SQL Editor, run the SQL in the section below.

4) Create an admin user:
   - Supabase Dashboard -> Authentication -> Users -> Add user (email + password)

5) Add a profile row for that user in the profiles table with is_admin=true.

### SQL to run (Tables + triggers + RLS)
Paste into Supabase SQL Editor and run:

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  request_email text null,
  note text null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  meta jsonb not null default '{}'::jsonb,
  decided_by uuid null references auth.users(id),
  decided_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists join_requests_address_unique on public.join_requests(address);

create table if not exists public.rate_limits (
  ip text not null,
  hour_start timestamptz not null,
  count int not null default 0,
  primary key (ip, hour_start)
);

create table if not exists public.app_state (
  key text primary key,
  value text not null
);

create table if not exists public.win_events (
  id bigserial primary key,
  height int not null,
  block_hash text not null,
  coinbase_txid text not null,
  payout_address text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_join_requests_updated_at on public.join_requests;
create trigger trg_join_requests_updated_at
before update on public.join_requests
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.join_requests enable row level security;
alter table public.rate_limits enable row level security;
alter table public.app_state enable row level security;
alter table public.win_events enable row level security;

create policy "profiles_read_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

Important: This app uses Netlify Functions with the Supabase SERVICE ROLE key to read/write the tables.
Do not expose the service role key to the browser.

## Environment variables

### Local (.env)
Create a file named .env in the project root:

VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

MINER_STATS_ENABLED=false
WIN_CHECK_ENABLED=true

### Netlify environment variables
In Netlify: Site settings -> Environment variables, set the same variables as above.

## Deploy to Netlify (via GitHub)
1) Push this repo to GitHub.
2) In Netlify: Add new site -> Import from Git -> choose your repo.
3) Build command: npm run build
4) Publish directory: dist
5) Add environment variables.
6) Deploy.

## Notes
- Miner stats endpoint is intentionally disabled by default.
- Scheduled function check-wins.mjs runs every minute and records win events for approved addresses.
