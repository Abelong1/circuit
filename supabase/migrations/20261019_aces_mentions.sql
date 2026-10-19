-- @mentions: notify members named as @handle in a post or comment.
create or replace function public.aces_mentioned_ids(p_body text) returns setof int
language sql stable security definer set search_path = public as $$
  select distinct u.id
  from regexp_matches(coalesce(p_body,''), '(?:^|[^A-Za-z0-9_])@([A-Za-z0-9_]{2,40})', 'g') m
  join aces_users u on lower(u.handle) = lower(m[1]) and u.status = 'active';
$$;

create or replace function public.aces_notify_mention_post() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into aces_notifications(user_id, actor_id, kind, post_id)
  select id, new.author_id, 'mention', new.id from aces_mentioned_ids(new.body) id
  where id <> new.author_id
    and (tg_op = 'INSERT' or id not in (select aces_mentioned_ids(old.body)));
  return null;
end $$;
create trigger aces_notify_mention_post after insert or update of body on public.aces_posts
  for each row execute function public.aces_notify_mention_post();

create or replace function public.aces_notify_mention_comment() returns trigger
language plpgsql security definer set search_path = public as $$
declare author int;
begin
  select author_id into author from aces_posts where id = new.post_id;
  insert into aces_notifications(user_id, actor_id, kind, post_id)
  select id, new.author_id, 'mention', new.post_id from aces_mentioned_ids(new.body) id
  where id <> new.author_id and id is distinct from author;  -- post author already gets a comment alert
  return null;
end $$;
create trigger aces_notify_mention_comment after insert on public.aces_comments
  for each row execute function public.aces_notify_mention_comment();

revoke execute on function public.aces_mentioned_ids(text), public.aces_notify_mention_post(), public.aces_notify_mention_comment() from public, anon, authenticated;
