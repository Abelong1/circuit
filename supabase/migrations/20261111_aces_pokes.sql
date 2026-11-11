-- Pokes: friends only, one active poke per pair, poke back clears the other side's poke.
create table public.aces_pokes (
  id serial primary key,
  poker_id int not null references public.aces_users(id) on delete cascade,
  poked_id int not null references public.aces_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poker_id, poked_id),
  check (poker_id <> poked_id)
);
alter table public.aces_pokes enable row level security;
create policy "pokes visible to participants" on public.aces_pokes for select to authenticated
using (exists (select 1 from public.aces_users u where u.auth_id = auth.uid() and u.id in (poker_id, poked_id)));

alter table public.aces_notifications drop constraint if exists aces_notifications_kind_check;
alter table public.aces_notifications add constraint aces_notifications_kind_check
check (kind = any (array['message','friend_request','friend_accept','comment','like','mention','poke']));

create or replace function public.aces_poke(target int)
returns void language plpgsql security definer set search_path = public as $$
declare me int;
begin
  select id into me from aces_users where auth_id = auth.uid() and status = 'active';
  if me is null then raise exception 'not signed in'; end if;
  if not exists (select 1 from aces_friends where status = 'accepted'
    and ((requester_id = me and addressee_id = target) or (requester_id = target and addressee_id = me))) then
    raise exception 'can only poke friends';
  end if;
  if exists (select 1 from aces_pokes where poker_id = me and poked_id = target) then
    raise exception 'already poked, wait for a poke back';
  end if;
  delete from aces_pokes where poker_id = target and poked_id = me;
  insert into aces_pokes (poker_id, poked_id) values (me, target);
  insert into aces_notifications (user_id, actor_id, kind) values (target, me, 'poke');
end $$;
revoke all on function public.aces_poke(int) from public, anon;
grant execute on function public.aces_poke(int) to authenticated;
