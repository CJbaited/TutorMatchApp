export interface TimeSlot {
  date: string;
  time: string;
  tutorId: string;
  studentId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// You can also move other booking-related interfaces here
export interface Booking {
  id: string;
  tutor_id: string;
  student_id: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: number;
  payment_method: 'card' | 'cash';
  payment_status: PaymentStatus;
  // Timing fields
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  restored_at?: string;
  // Completion details
  completion_type?: 'manual' | 'automatic';
  completion_notes?: string;
  completion_code?: string;
  completion_attempts: number;
  // Cancellation details
  cancellation_reason?: string;
  cancellation_type?: string;
  cancellation_notification_sent: boolean;
  cancellation_notification_time?: string;
  // Grace period
  grace_period_minutes: number;
  // Rating
  student_rating?: number;
  has_rated: boolean;
  // Restoration
  restored_by?: string;
  restoration_reason?: string;
}

export interface BookingScreenProps {
  tutorId: string;
  tutorName: string;
  price: number;
}

export interface BookingError {
  code: string;
  message: string;
}

export interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  error: BookingError | null;
  refreshBookings: () => Promise<void>;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'disputed';