-- Notifications for Circuit: messages, friend requests/accepts, comments and likes on your posts.
-- Rows are written only by these triggers; each member can read, mark read, and delete their own.
create table public.aces_notifications(
  id serial primary key,
  user_id int not null references public.aces_users(id) on delete cascade,
  actor_id int references public.aces_users(id) on delete cascade,
  kind text not null check (kind in ('message','friend_request','friend_accept','comment','like','mention')),
  post_id int references public.aces_posts(id) on delete cascade,
  conversation_id int references public.aces_conversations(id) on delete cascade,
  count int not null default 1,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index aces_notifications_user_idx on public.aces_notifications(user_id, created_at desc);
alter table public.aces_notifications enable row level security;
create policy "own notifications: read" on public.aces_notifications for select using (user_id = public.aces_me());
create policy "own notifications: mark read" on public.aces_notifications for update using (user_id = public.aces_me()) with check (user_id = public.aces_me());
create policy "own notifications: delete" on public.aces_notifications for delete using (user_id = public.aces_me());
alter publication supabase_realtime add table public.aces_notifications;

-- new message: one unread notification per chat, bumped and counted
create or replace function public.aces_notify_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in select user_id from aces_conversation_members where conversation_id = new.conversation_id and user_id <> new.sender_id loop
    update aces_notifications set count = count + 1, actor_id = new.sender_id, created_at = now()
      where user_id = r.user_id and kind = 'message' and conversation_id = new.conversation_id and read_at is null;
    if not found then
      insert into aces_notifications(user_id, actor_id, kind, conversation_id) values (r.user_id, new.sender_id, 'message', new.conversation_id);
    end if;
  end loop;
  return null;
end $$;
create trigger aces_notify_message after insert on public.aces_messages for each row execute function public.aces_notify_message();

-- friend request sent / accepted
create or replace function public.aces_notify_friend() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.status <> 'accepted' then
    insert into aces_notifications(user_id, actor_id, kind) values (new.addressee_id, new.requester_id, 'friend_request');
  elsif tg_op = 'UPDATE' and new.status = 'accepted' and old.status <> 'accepted' then
    insert into aces_notifications(user_id, actor_id, kind) values (new.requester_id, new.addressee_id, 'friend_accept');
    delete from aces_notifications where user_id = new.addressee_id and actor_id = new.requester_id and kind = 'friend_request';
  end if;
  return null;
end $$;
create trigger aces_notify_friend after insert or update on public.aces_friends for each row execute function public.aces_notify_friend();

-- comment on my post
create or replace function public.aces_notify_comment() returns trigger
language plpgsql security definer set search_path = public as $$
declare author int;
begin
  select author_id into author from aces_posts where id = new.post_id;
  if author is not null and author <> new.author_id then
    insert into aces_notifications(user_id, actor_id, kind, post_id) values (author, new.author_id, 'comment', new.post_id);
  end if;
  return null;
end $$;
create trigger aces_notify_comment after insert on public.aces_comments for each row execute function public.aces_notify_comment();

-- like on my post (removed again if they unlike before I see it)
create or replace function public.aces_notify_like() returns trigger
language plpgsql security definer set search_path = public as $$
declare author int;
begin
  if tg_op = 'INSERT' then
    if new.target_type <> 'post' then return null; end if;
    select author_id into author from aces_posts where id = new.target_id;
    if author is not null and author <> new.user_id then
      insert into aces_notifications(user_id, actor_id, kind, post_id) values (author, new.user_id, 'like', new.target_id);
    end if;
  elsif old.target_type = 'post' then
    delete from aces_notifications where kind = 'like' and post_id = old.target_id and actor_id = old.user_id and read_at is null;
  end if;
  return null;
end $$;
create trigger aces_notify_like after insert or delete on public.aces_reactions for each row execute function public.aces_notify_like();

revoke execute on function public.aces_notify_message(), public.aces_notify_friend(), public.aces_notify_comment(), public.aces_notify_like() from public, anon, authenticated;
