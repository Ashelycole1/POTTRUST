create table public.group_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  sacco_name   text not null,
  status       text not null default 'PENDING',
  created_at   timestamp with time zone default now()
);

-- RLS for group_requests
alter table public.group_requests enable row level security;

create policy "group_requests: insert own" on public.group_requests
  for insert with check (auth.uid()::text = (select clerk_id from public.users where id = user_id));

create policy "group_requests: read own" on public.group_requests
  for select using (auth.uid()::text = (select clerk_id from public.users where id = user_id));

create policy "group_requests: open access for admin" on public.group_requests
  for all to public using (true) with check (true);

-- RPC for approving a group request atomically
create or replace function public.approve_group_request(req_id uuid, admin_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  req record;
  new_group_id uuid;
begin
  select * into req from public.group_requests where id = req_id;
  if not found then
    raise exception 'Request not found';
  end if;

  if req.status != 'PENDING' then
    raise exception 'Request is already processed';
  end if;

  -- 1. Create the new group
  insert into public.groups (name, created_by, total_pot)
  values (req.sacco_name, admin_user_id, 0)
  returning id into new_group_id;

  -- 2. Add the requester as the Chairperson
  insert into public.group_members (group_id, user_id, role)
  values (new_group_id, req.user_id, 'Chairperson');

  -- 3. Mark the request as APPROVED
  update public.group_requests
  set status = 'APPROVED'
  where id = req_id;
end;
$$;
