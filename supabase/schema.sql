-- Atelier Python : comptes, progression et classement.
-- À exécuter une fois dans Supabase → SQL Editor (ou avec la CLI : supabase db push).
-- Il faut aussi activer dans Authentication → Providers : « Anonymous sign-ins », « Email », et si possible « Google ».

-- Profil public minimal : un pseudo et un code de classe. Jamais l'e-mail.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  pseudo text not null check (char_length(pseudo) between 2 and 24),
  classe text check (classe ~ '^[A-Z0-9-]{3,20}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Progression complète de l'élève (le même objet que dans le navigateur), pour la retrouver sur un autre appareil.
create table if not exists public.progress (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null default '{}'::jsonb,
  xp integer not null default 0 check (xp between 0 and 200000),
  lessons_done integer not null default 0,
  streak integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Chaque gain d'XP, pour le classement de la semaine.
create table if not exists public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  amount integer not null check (amount between 1 and 100),
  created_at timestamptz not null default now()
);
create index if not exists xp_events_user_time on public.xp_events (user_id, created_at);
create index if not exists profiles_classe on public.profiles (classe);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.xp_events enable row level security;

-- Chacun ne lit et n'écrit que ses propres lignes.
drop policy if exists "profil: lire le sien" on public.profiles;
create policy "profil: lire le sien" on public.profiles for select using (id = auth.uid());
drop policy if exists "profil: créer le sien" on public.profiles;
create policy "profil: créer le sien" on public.profiles for insert with check (id = auth.uid());
drop policy if exists "profil: modifier le sien" on public.profiles;
create policy "profil: modifier le sien" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "progression: lire la sienne" on public.progress;
create policy "progression: lire la sienne" on public.progress for select using (user_id = auth.uid());
drop policy if exists "progression: créer la sienne" on public.progress;
create policy "progression: créer la sienne" on public.progress for insert with check (user_id = auth.uid());
drop policy if exists "progression: modifier la sienne" on public.progress;
create policy "progression: modifier la sienne" on public.progress for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "xp: ajouter les siens" on public.xp_events;
create policy "xp: ajouter les siens" on public.xp_events for insert with check (user_id = auth.uid());
drop policy if exists "xp: lire les siens" on public.xp_events;
create policy "xp: lire les siens" on public.xp_events for select using (user_id = auth.uid());

-- Garde-fou contre la triche grossière : 3 000 XP maximum par jour et par élève.
create or replace function public.limite_xp() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select coalesce(sum(amount), 0) from public.xp_events
      where user_id = new.user_id and created_at > now() - interval '1 day') + new.amount > 3000 then
    raise exception 'Limite quotidienne d''XP atteinte';
  end if;
  return new;
end $$;
drop trigger if exists limite_xp on public.xp_events;
create trigger limite_xp before insert on public.xp_events for each row execute function public.limite_xp();

-- Classement d'une classe. Seuls les membres de la classe peuvent le lire.
-- semaine = true : XP gagnés depuis lundi (heure de Paris). semaine = false : XP total.
create or replace function public.classement(p_classe text, p_semaine boolean default true)
returns table (pseudo text, xp bigint, moi boolean)
language sql stable security definer set search_path = public as $$
  with debut as (
    select (date_trunc('week', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris') as t
  )
  select p.pseudo,
         case when p_semaine
              then coalesce((select sum(e.amount) from public.xp_events e, debut where e.user_id = p.id and e.created_at >= debut.t), 0)
              else coalesce((select g.xp from public.progress g where g.user_id = p.id), 0)::bigint end as xp,
         p.id = auth.uid() as moi
  from public.profiles p
  where p.classe = upper(p_classe)
    and exists (select 1 from public.profiles m where m.id = auth.uid() and m.classe = upper(p_classe))
  order by xp desc, p.pseudo
  limit 200;
$$;
revoke all on function public.classement(text, boolean) from public;
grant execute on function public.classement(text, boolean) to authenticated;

-- Nombre d'élèves dans une classe (pour afficher « 23 élèves » avant de rejoindre).
create or replace function public.taille_classe(p_classe text) returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.profiles where classe = upper(p_classe);
$$;
grant execute on function public.taille_classe(text) to anon, authenticated;
