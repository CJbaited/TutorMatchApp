-- Drop existing constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add updated constraint with in_progress status
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (
  status = ANY (ARRAY[
    'pending'::text,
    'confirmed'::text,
    'cancelled'::text,
    'completed'::text,
    'in_progress'::text
  ])
);
