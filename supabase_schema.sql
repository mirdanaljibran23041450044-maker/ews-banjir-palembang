-- Aktifkan ekstensi PostGIS (jika belum aktif)
create extension if not exists postgis;

-- 1. Tabel Sensors (Stasiun EWS)
create table sensors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  problem_type text,
  location geometry(Point, 4326), -- PostGIS point (longitude, latitude)
  lat double precision,
  lng double precision,
  calibration_offset double precision default 0,
  siaga_threshold double precision default 100,
  darurat_threshold double precision default 150,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabel Health Metrics (Log Telemetri)
create table health_metrics (
  id uuid default gen_random_uuid() primary key,
  sensor_id uuid references sensors(id) on delete cascade,
  water_level double precision not null,
  battery_level double precision not null,
  is_online boolean default true,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabel Reports (Laporan Lapangan)
create table reports (
  id uuid default gen_random_uuid() primary key,
  sender_name text not null,
  location_desc text not null,
  description text not null,
  status text default 'pending', -- pending, dispatched, resolved, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabel Contacts (Untuk Broadcast WA/SMS)
create table contacts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  channel text default 'WA',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabel Audit Logs
create table audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_name text not null,
  action text not null,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Masukkan beberapa data awal (seeding)
insert into sensors (name, problem_type, lat, lng, siaga_threshold, darurat_threshold)
values 
  ('Simpang Polda', 'Bottleneck', -2.976, 104.775, 100, 150),
  ('Kambang Iwak', 'Sedimentasi', -2.985, 104.744, 80, 120),
  ('Jl. Mayor Ruslan', 'Pasang Surut', -2.969, 104.755, 90, 130);

insert into reports (sender_name, location_desc, description, status)
values
  ('LAPOR! User', 'Simpang Polda', 'Genangan 30cm, macet total dari arah RS Siti Khadijah', 'pending'),
  ('Petugas Lapangan Budi', 'Jl. R. Sukamto', 'Saluran air tersumbat sampah plastik', 'dispatched');

-- 6. Tabel Profiles (Manajemen Akun dan Role)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  role text not null default 'operator', -- super_admin, operator, public
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Trigger untuk membuat profil secara otomatis saat sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'operator'),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
