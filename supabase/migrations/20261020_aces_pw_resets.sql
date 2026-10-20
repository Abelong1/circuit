-- Admin-assisted password reset (no email needed).
-- Member taps "Forgot password" -> request lands in admin dashboard ->
-- officer sets a temporary password and hands it over in person ->
-- member must choose a new password on next login.

alter table public.aces_users add column if not exists must_change_pw boolean not null default false;

create table if not exists public.aces_pw_resets (
  id serial primary key,
  user_id integer not null references public.aces_users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','done','dismissed')),
  created_at timestamptz not null default now(),
  handled_by integer references public.aces_users(id),
  handled_at timestamptz
);
create index if not exists aces_pw_resets_pending_idx on public.aces_pw_resets (status, created_at desc);
alter table public.aces_pw_resets enable row level security;
drop policy if exists aces_pw_resets_admin_read on public.aces_pw_resets;
create policy aces_pw_resets_admin_read on public.aces_pw_resets for select using (public.aces_is_admin());

-- Anyone (logged out) can request. Always returns silently so it never reveals whether an email exists.
create or replace function public.aces_request_pw_reset(p_email text)
returns void language plpgsql security definer set search_path to 'public' as $$
declare u public.aces_users;
begin
  select * into u from public.aces_users where lower(email) = lower(trim(coalesce(p_email,'')));
  if not found or u.status = 'banned' then return; end if;
  if exists (select 1 from public.aces_pw_resets where user_id = u.id and status = 'pending') then return; end if;
  insert into public.aces_pw_resets (user_id) values (u.id);
end $$;

-- Officer sets a temporary password. Signs the member out everywhere.
create or replace function public.aces_admin_reset_pw(p_request_id integer, p_new_pw text)
returns void language plpgsql security definer set search_path to 'public' as $$
declare r public.aces_pw_resets; u public.aces_users;
begin
  if not public.aces_is_admin() then raise exception 'admins only'; end if;
  if length(coalesce(p_new_pw,'')) < 8 then raise exception 'temporary password must be at least 8 characters'; end if;
  select * into r from public.aces_pw_resets where id = p_request_id and status = 'pending';
  if not found then raise exception 'request not found or already handled'; end if;
  select * into u from public.aces_users where id = r.user_id;
  if u.status = 'banned' then raise exception 'this account is banned'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_new_pw, extensions.gen_salt('bf')), updated_at = now()
    where id = u.auth_id;
  delete from auth.sessions where user_id = u.auth_id;
  update public.aces_users set must_change_pw = true where id = u.id;
  update public.aces_pw_resets set status = 'done', handled_by = public.aces_me(), handled_at = now() where id = r.id;
  insert into public.aces_audit_log (admin_id, action, target_type, target_id, notes)
    values (public.aces_me(), 'reset_password', 'user', u.id, 'temporary password set');
end $$;

create or replace function public.aces_admin_dismiss_pw_reset(p_request_id integer)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if not public.aces_is_admin() then raise exception 'admins only'; end if;
  update public.aces_pw_resets set status = 'dismissed', handled_by = public.aces_me(), handled_at = now()
    where id = p_request_id and status = 'pending';
  insert into public.aces_audit_log (admin_id, action, target_type, target_id, notes)
    values (public.aces_me(), 'dismiss_pw_reset', 'pw_reset', p_request_id, null);
end $$;

-- Member clears the flag after choosing their own password.
create or replace function public.aces_pw_changed()
returns void language sql security definer set search_path to 'public' as $$
  update public.aces_users set must_change_pw = false where auth_id = auth.uid();
$$;

revoke all on function public.aces_request_pw_reset(text) from public;
revoke all on function public.aces_admin_reset_pw(integer, text) from public, anon;
revoke all on function public.aces_admin_dismiss_pw_reset(integer) from public, anon;
revoke all on function public.aces_pw_changed() from public, anon;
grant execute on function public.aces_request_pw_reset(text) to anon, authenticated;
grant execute on function public.aces_admin_reset_pw(integer, text) to authenticated;
grant execute on function public.aces_admin_dismiss_pw_reset(integer) to authenticated;
grant execute on function public.aces_pw_changed() to authenticated;
