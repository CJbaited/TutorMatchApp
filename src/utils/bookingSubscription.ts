import supabase from '../services/supabase';
import { Booking } from '../types/booking';

type BookingUpdateHandler = (booking: Booking) => void;

export const subscribeToBookings = (
  userId: string,
  role: 'student' | 'tutor',
  onUpdate: BookingUpdateHandler
) => {
  const column = role === 'student' ? 'student_id' : 'tutor_id';

  return supabase
    .channel('bookings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `${column}=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as Booking);
        }
      }
    )
    .subscribe();
};

export const unsubscribeFromBookings = () => {
  supabase.removeAllChannels();
};
