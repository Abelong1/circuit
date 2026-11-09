-- For Sale feed: price + sold tag
alter table public.aces_posts drop constraint aces_posts_feed_check;
alter table public.aces_posts add constraint aces_posts_feed_check check (feed = any (array['help','hiring','moments','sale']));
alter table public.aces_posts add column price numeric(10,2) check (price is null or price >= 0);
alter table public.aces_posts add column is_sold boolean not null default false;

-- Lock reads to confirmed, non-banned members
create or replace function public.aces_can_read() returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (select 1 from public.aces_users u join auth.users a on a.id=u.auth_id
    where u.auth_id=auth.uid() and u.status<>'banned' and a.email_confirmed_at is not null);
$$;
revoke execute on function public.aces_can_read() from public, anon;
grant execute on function public.aces_can_read() to authenticated;
alter policy posts_select on public.aces_posts using (public.aces_can_read());
alter policy comments_select on public.aces_comments using (public.aces_can_read());
alter policy reactions_select on public.aces_reactions using (public.aces_can_read());
alter policy announcement_read on public.aces_announcement using (public.aces_can_read());

-- No anonymous access to RPCs or the handles view
revoke select on public.aces_handles from anon;
do $$ declare f record; begin
for f in select p.oid::regprocedure sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'aces_%' and p.prosecdef loop
  execute format('revoke execute on function %s from public, anon', f.sig);
  execute format('grant execute on function %s to authenticated', f.sig);
end loop; end $$;
