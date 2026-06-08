-- Add booking_block_id uuid column to bookings table to link recurring slots
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_block_id uuid;

-- Index for performant filtering/searching of block groups
CREATE INDEX IF NOT EXISTS bookings_booking_block_id_idx ON public.bookings(booking_block_id);
