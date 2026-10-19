-- Lets the app show "· edited" on posts changed after posting.
alter table public.aces_posts add column if not exists edited_at timestamptz;
