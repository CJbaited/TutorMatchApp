create table session_rules (
  id uuid default uuid_generate_v4() primary key,
  name varchar not null,
  duration interval not null,
  auto_complete_after interval not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add default rules
insert into session_rules (name, duration, auto_complete_after) values
  ('standard', interval '1 hour', interval '2 hours');

-- Add completion tracking to bookings
alter table bookings 
  add column status varchar check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed')) default 'pending',
  add column started_at timestamp with time zone,
  add column completed_at timestamp with time zone,
  add column completion_type varchar check (completion_type in ('manual', 'automatic', null)),
  add column completion_notes text,
  add column payment_status varchar default 'pending' check (payment_status in ('pending', 'completed', 'refunded', 'disputed'));

-- Update existing rows to ensure data consistency
update bookings 
set status = 'pending' 
where status is null;

-- Drop and recreate the constraint if it already exists
alter table bookings 
  drop constraint if exists bookings_status_check;

alter table bookings 
  add constraint bookings_status_check 
  check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'));
