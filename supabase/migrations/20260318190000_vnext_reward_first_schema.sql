alter table public.rewards
  add column if not exists plan_type text not null default 'one_time',
  add column if not exists status text not null default 'active',
  add column if not exists target_date date,
  add column if not exists motivation_note text,
  add column if not exists abandon_reason text,
  add column if not exists reflection_note text,
  add column if not exists priority integer not null default 0;

alter table public.rewards
  drop constraint if exists rewards_plan_type_check;

alter table public.rewards
  add constraint rewards_plan_type_check
  check (plan_type in ('one_time', 'repeatable'));

alter table public.rewards
  drop constraint if exists rewards_status_check;

alter table public.rewards
  add constraint rewards_status_check
  check (status in ('wish', 'validating', 'active', 'ready_to_redeem', 'redeemed', 'abandoned'));

alter table public.habits
  add column if not exists frequency text not null default 'daily',
  add column if not exists target_count integer not null default 1;

alter table public.habits
  drop constraint if exists habits_frequency_check;

alter table public.habits
  add constraint habits_frequency_check
  check (frequency in ('daily', 'weekly', 'monthly'));

alter table public.habits
  drop constraint if exists habits_target_count_check;

alter table public.habits
  add constraint habits_target_count_check
  check (target_count > 0);

alter table public.habit_completions
  add column if not exists plan_id_snapshot uuid references public.rewards(id) on delete set null,
  add column if not exists frequency_bucket text,
  add column if not exists evidence_type text;

update public.rewards
set
  plan_type = coalesce(plan_type, 'one_time'),
  status = case
    when is_redeemed then 'redeemed'
    when current_energy >= energy_cost and energy_cost > 0 then 'ready_to_redeem'
    else coalesce(status, 'active')
  end,
  priority = coalesce(priority, 0);

update public.habits
set
  frequency = coalesce(frequency, 'daily'),
  target_count = coalesce(target_count, 1);

update public.habit_completions
set frequency_bucket = coalesce(frequency_bucket, 'daily');

create table if not exists public.reward_bindings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  reward_id uuid references public.rewards(id) on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  allocation_mode text not null default 'exclusive',
  allocation_ratio numeric(5,2) not null default 1.0,
  created_at timestamp with time zone not null default now(),
  unique (reward_id, habit_id)
);

alter table public.reward_bindings
  drop constraint if exists reward_bindings_allocation_mode_check;

alter table public.reward_bindings
  add constraint reward_bindings_allocation_mode_check
  check (allocation_mode in ('exclusive', 'shared'));

alter table public.reward_bindings enable row level security;

create policy "Users can view their own reward bindings"
  on public.reward_bindings
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own reward bindings"
  on public.reward_bindings
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reward bindings"
  on public.reward_bindings
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own reward bindings"
  on public.reward_bindings
  for delete
  using (auth.uid() = user_id);
