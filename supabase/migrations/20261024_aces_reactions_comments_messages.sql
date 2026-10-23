-- Emoji reactions on comments and chat messages.
-- Comments reuse aces_reactions (target_type='comment'); messages get their own table
-- so only chat members can see them (aces_reactions is readable by everyone).

-- one reaction per member per message; picking another emoji replaces it
create table if not exists public.aces_message_reactions(
  message_id int not null references public.aces_messages(id) on delete cascade,
  user_id int not null references public.aces_users(id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);
alter table public.aces_message_reactions enable row level security;

create or replace function public.aces_in_message_conv(p_msg int) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from aces_messages m join aces_conversation_members c on c.conversation_id = m.conversation_id
                where m.id = p_msg and c.user_id = aces_me());
$$;
revoke execute on function public.aces_in_message_conv(int) from public, anon;
grant execute on function public.aces_in_message_conv(int) to authenticated;

create policy "msg reactions: members read" on public.aces_message_reactions for select using (public.aces_in_message_conv(message_id));
create policy "msg reactions: add own" on public.aces_message_reactions for insert with check (user_id = public.aces_me() and public.aces_in_message_conv(message_id));
create policy "msg reactions: change own" on public.aces_message_reactions for update using (user_id = public.aces_me()) with check (user_id = public.aces_me());
create policy "msg reactions: remove own" on public.aces_message_reactions for delete using (user_id = public.aces_me());
alter publication supabase_realtime add table public.aces_message_reactions;

-- clear comment reactions when the comment goes (incl. via post delete cascade)
create or replace function public.aces_cleanup_comment_reactions() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from aces_reactions where target_type = 'comment' and target_id = old.id;
  return null;
end $$;
create trigger aces_cleanup_comment_reactions after delete on public.aces_comments
  for each row execute function public.aces_cleanup_comment_reactions();
revoke execute on function public.aces_cleanup_comment_reactions() from public, anon, authenticated;
