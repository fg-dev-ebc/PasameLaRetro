create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists btree_gist with schema extensions;

do $$ begin create type public.user_role as enum ('owner', 'renter', 'both'); exception when duplicate_object then null; end $$;
do $$ begin create type public.equipment_condition as enum ('new', 'excellent', 'good', 'fair', 'needs_service'); exception when duplicate_object then null; end $$;
do $$ begin create type public.equipment_status as enum ('active', 'paused', 'maintenance', 'archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed', 'rejected'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  role public.user_role not null default 'renter',
  phone text,
  location text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text not null,
  price_per_hour numeric(12,2) not null check (price_per_hour >= 0),
  price_per_day numeric(12,2) check (price_per_day is null or price_per_day >= 0),
  deposit_amount numeric(12,2) check (deposit_amount is null or deposit_amount >= 0),
  currency text not null default 'MXN',
  condition public.equipment_condition not null default 'good',
  status public.equipment_status not null default 'active',
  location text not null,
  city text,
  state text,
  specs jsonb not null default '{}'::jsonb,
  min_rental_hours integer not null default 1 check (min_rental_hours > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.equipment_images (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  path text not null,
  public_url text not null,
  alt_text text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (equipment_id, path)
);

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create table if not exists public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  exception_date date not null,
  start_time time,
  end_time time,
  is_available boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  check ((start_time is null and end_time is null) or (start_time is not null and end_time is not null and start_time < end_time))
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.booking_status not null default 'pending',
  total_price numeric(12,2) not null default 0 check (total_price >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_at < end_at),
  check (owner_id <> renter_id)
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, equipment_id)
);

create index if not exists equipment_owner_idx on public.equipment(owner_id);
create index if not exists equipment_category_idx on public.equipment(category_id);
create index if not exists equipment_status_created_idx on public.equipment(status, created_at desc);
create index if not exists equipment_location_idx on public.equipment(location);
create index if not exists equipment_images_equipment_idx on public.equipment_images(equipment_id, position);
create index if not exists availability_rules_equipment_weekday_idx on public.availability_rules(equipment_id, weekday);
create index if not exists availability_exceptions_equipment_date_idx on public.availability_exceptions(equipment_id, exception_date);
create index if not exists bookings_equipment_time_idx on public.bookings(equipment_id, start_at, end_at);
create index if not exists bookings_owner_idx on public.bookings(owner_id, created_at desc);
create index if not exists bookings_renter_idx on public.bookings(renter_id, created_at desc);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_no_overlapping_active') then
    alter table public.bookings add constraint bookings_no_overlapping_active
      exclude using gist (equipment_id with =, tstzrange(start_at, end_at, '[)') with &&)
      where (status in ('pending', 'confirmed'));
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare requested_role public.user_role;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' in ('owner', 'renter', 'both') then (new.raw_user_meta_data ->> 'role')::public.user_role
    else 'renter'::public.user_role
  end;

  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), new.raw_user_meta_data ->> 'avatar_url', requested_role)
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.is_equipment_available(p_equipment_id uuid, p_start_at timestamptz, p_end_at timestamptz)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  v_start_date date := (p_start_at at time zone 'UTC')::date;
  v_end_date date := (p_end_at at time zone 'UTC')::date;
  v_start_time time := (p_start_at at time zone 'UTC')::time;
  v_end_time time := (p_end_at at time zone 'UTC')::time;
  v_weekday smallint := extract(dow from (p_start_at at time zone 'UTC'))::smallint;
begin
  if p_start_at >= p_end_at or v_start_date <> v_end_date then return false; end if;
  if not exists (select 1 from public.equipment where id = p_equipment_id and status = 'active') then return false; end if;
  if exists (
    select 1 from public.availability_exceptions
    where equipment_id = p_equipment_id and exception_date = v_start_date and is_available = false
      and (start_time is null or end_time is null or (v_start_time < end_time and v_end_time > start_time))
  ) then return false; end if;
  if exists (
    select 1 from public.availability_exceptions
    where equipment_id = p_equipment_id and exception_date = v_start_date and is_available = true
      and start_time <= v_start_time and end_time >= v_end_time
  ) then return true; end if;
  return exists (
    select 1 from public.availability_rules
    where equipment_id = p_equipment_id and weekday = v_weekday and is_available = true
      and start_time <= v_start_time and end_time >= v_end_time
  );
end;
$$;

create or replace function public.prepare_booking()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_owner_id uuid;
  v_price_per_hour numeric(12,2);
begin
  select owner_id, price_per_hour into v_owner_id, v_price_per_hour
  from public.equipment where id = new.equipment_id and status = 'active';
  if v_owner_id is null then raise exception 'equipment_not_available'; end if;
  new.owner_id := v_owner_id;
  if new.renter_id = new.owner_id then raise exception 'cannot_book_own_equipment'; end if;
  if new.status in ('pending', 'confirmed') and not public.is_equipment_available(new.equipment_id, new.start_at, new.end_at) then
    raise exception 'equipment_unavailable_for_selected_window';
  end if;
  new.total_price := round((extract(epoch from (new.end_at - new.start_at)) / 3600.0) * v_price_per_hour, 2);
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists equipment_set_updated_at on public.equipment;
create trigger equipment_set_updated_at before update on public.equipment for each row execute function public.set_updated_at();
drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at before update on public.bookings for each row execute function public.set_updated_at();
drop trigger if exists bookings_prepare on public.bookings;
create trigger bookings_prepare before insert or update of equipment_id, renter_id, owner_id, start_at, end_at, status on public.bookings for each row execute function public.prepare_booking();
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.categories (name, slug, description) values
  ('Excavadoras', 'excavadoras', 'Equipos para excavacion, movimiento de tierra y obra civil.'),
  ('Retroexcavadoras', 'retroexcavadoras', 'Maquinaria versatil para excavacion ligera, carga y zanjas.'),
  ('Montacargas', 'montacargas', 'Equipos de carga, almacen y movimiento industrial.'),
  ('Gruas', 'gruas', 'Gruas y equipos de elevacion para obra y montaje.'),
  ('Compactacion', 'compactacion', 'Rodillos, placas y equipos para compactar terreno.'),
  ('Generadores', 'generadores', 'Generadores electricos y respaldo para obra.'),
  ('Plataformas', 'plataformas', 'Plataformas de elevacion y trabajo en altura.'),
  ('Camiones', 'camiones', 'Camiones de volteo, carga y transporte especializado.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.equipment enable row level security;
alter table public.equipment_images enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.bookings enable row level security;
alter table public.favorites enable row level security;

drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public on public.profiles for select using (true);
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists categories_select_public on public.categories;
create policy categories_select_public on public.categories for select using (true);

drop policy if exists equipment_select_active_or_owner on public.equipment;
create policy equipment_select_active_or_owner on public.equipment for select using (status = 'active' or owner_id = auth.uid());
drop policy if exists equipment_insert_owner on public.equipment;
create policy equipment_insert_owner on public.equipment for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists equipment_update_owner on public.equipment;
create policy equipment_update_owner on public.equipment for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists equipment_delete_owner on public.equipment;
create policy equipment_delete_owner on public.equipment for delete to authenticated using (owner_id = auth.uid());

drop policy if exists equipment_images_select_public_or_owner on public.equipment_images;
create policy equipment_images_select_public_or_owner on public.equipment_images for select using (
  exists (select 1 from public.equipment where equipment.id = equipment_images.equipment_id and (equipment.status = 'active' or equipment.owner_id = auth.uid()))
);
drop policy if exists equipment_images_insert_owner on public.equipment_images;
create policy equipment_images_insert_owner on public.equipment_images for insert to authenticated with check (
  exists (select 1 from public.equipment where equipment.id = equipment_images.equipment_id and equipment.owner_id = auth.uid())
);
drop policy if exists equipment_images_update_owner on public.equipment_images;
create policy equipment_images_update_owner on public.equipment_images for update to authenticated using (
  exists (select 1 from public.equipment where equipment.id = equipment_images.equipment_id and equipment.owner_id = auth.uid())
) with check (
  exists (select 1 from public.equipment where equipment.id = equipment_images.equipment_id and equipment.owner_id = auth.uid())
);
drop policy if exists equipment_images_delete_owner on public.equipment_images;
create policy equipment_images_delete_owner on public.equipment_images for delete to authenticated using (
  exists (select 1 from public.equipment where equipment.id = equipment_images.equipment_id and equipment.owner_id = auth.uid())
);

drop policy if exists availability_rules_select_public_or_owner on public.availability_rules;
create policy availability_rules_select_public_or_owner on public.availability_rules for select using (
  exists (select 1 from public.equipment where equipment.id = availability_rules.equipment_id and (equipment.status = 'active' or equipment.owner_id = auth.uid()))
);
drop policy if exists availability_rules_manage_owner on public.availability_rules;
create policy availability_rules_manage_owner on public.availability_rules for all to authenticated using (
  exists (select 1 from public.equipment where equipment.id = availability_rules.equipment_id and equipment.owner_id = auth.uid())
) with check (
  exists (select 1 from public.equipment where equipment.id = availability_rules.equipment_id and equipment.owner_id = auth.uid())
);

drop policy if exists availability_exceptions_select_public_or_owner on public.availability_exceptions;
create policy availability_exceptions_select_public_or_owner on public.availability_exceptions for select using (
  exists (select 1 from public.equipment where equipment.id = availability_exceptions.equipment_id and (equipment.status = 'active' or equipment.owner_id = auth.uid()))
);
drop policy if exists availability_exceptions_manage_owner on public.availability_exceptions;
create policy availability_exceptions_manage_owner on public.availability_exceptions for all to authenticated using (
  exists (select 1 from public.equipment where equipment.id = availability_exceptions.equipment_id and equipment.owner_id = auth.uid())
) with check (
  exists (select 1 from public.equipment where equipment.id = availability_exceptions.equipment_id and equipment.owner_id = auth.uid())
);

drop policy if exists bookings_select_participants on public.bookings;
create policy bookings_select_participants on public.bookings for select to authenticated using (owner_id = auth.uid() or renter_id = auth.uid());
drop policy if exists bookings_insert_renter on public.bookings;
create policy bookings_insert_renter on public.bookings for insert to authenticated with check (
  renter_id = auth.uid()
  and exists (select 1 from public.equipment where equipment.id = bookings.equipment_id and equipment.status = 'active' and equipment.owner_id = bookings.owner_id and equipment.owner_id <> auth.uid())
);
drop policy if exists bookings_update_participants on public.bookings;
create policy bookings_update_participants on public.bookings for update to authenticated using (owner_id = auth.uid() or renter_id = auth.uid()) with check (
  owner_id = auth.uid() or (renter_id = auth.uid() and status = 'cancelled')
);

drop policy if exists favorites_select_own on public.favorites;
create policy favorites_select_own on public.favorites for select to authenticated using (user_id = auth.uid());
drop policy if exists favorites_insert_own on public.favorites;
create policy favorites_insert_own on public.favorites for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.equipment where equipment.id = favorites.equipment_id and equipment.status = 'active')
);
drop policy if exists favorites_delete_own on public.favorites;
create policy favorites_delete_own on public.favorites for delete to authenticated using (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('equipment-images', 'equipment-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "equipment_images_storage_select_public" on storage.objects;
drop policy if exists "equipment_images_storage_insert_owner" on storage.objects;
create policy "equipment_images_storage_insert_owner" on storage.objects for insert to authenticated with check (
  bucket_id = 'equipment-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (select 1 from public.equipment where equipment.id::text = (storage.foldername(name))[2] and equipment.owner_id = auth.uid())
);
drop policy if exists "equipment_images_storage_update_owner" on storage.objects;
create policy "equipment_images_storage_update_owner" on storage.objects for update to authenticated using (
  bucket_id = 'equipment-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (select 1 from public.equipment where equipment.id::text = (storage.foldername(name))[2] and equipment.owner_id = auth.uid())
) with check (
  bucket_id = 'equipment-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (select 1 from public.equipment where equipment.id::text = (storage.foldername(name))[2] and equipment.owner_id = auth.uid())
);
drop policy if exists "equipment_images_storage_delete_owner" on storage.objects;
create policy "equipment_images_storage_delete_owner" on storage.objects for delete to authenticated using (
  bucket_id = 'equipment-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (select 1 from public.equipment where equipment.id::text = (storage.foldername(name))[2] and equipment.owner_id = auth.uid())
);

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prepare_booking() from public, anon, authenticated;
revoke execute on function public.is_equipment_available(uuid, timestamptz, timestamptz) from public, anon, authenticated;
