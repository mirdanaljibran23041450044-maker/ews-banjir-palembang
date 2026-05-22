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
