import { Booking } from '../types/booking';

export const shouldAutoCancel = (booking: Booking): { shouldCancel: boolean; reason: string } => {
  if (['completed', 'cancelled', 'disputed'].includes(booking.status)) {
    return { shouldCancel: false, reason: '' };
  }

  const now = new Date();
  const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
  const gracePeriod = booking.grace_period_minutes || 15;
  
  // For pending bookings - cancel if start time + grace period has passed
  if (booking.status === 'pending') {
    const cutoffTime = new Date(bookingDateTime.getTime() + (gracePeriod * 60 * 1000));
    if (now > cutoffTime) {
      return {
        shouldCancel: true,
        reason: `Auto-cancelled: Session start time + ${gracePeriod} min grace period passed`
      };
    }
  }
  
  // For confirmed/in_progress bookings - cancel if 3 hours past start time
  if (['confirmed', 'in_progress'].includes(booking.status)) {
    const threeHoursAfterStart = new Date(bookingDateTime.getTime() + (3 * 60 * 60 * 1000));
    if (now > threeHoursAfterStart) {
      return {
        shouldCancel: true,
        reason: 'Auto-cancelled: Session exceeded maximum duration (3 hours)'
      };
    }
  }
  
  return { shouldCancel: false, reason: '' };
};