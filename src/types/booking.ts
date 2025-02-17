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
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  price: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'refunded' | 'disputed';
  started_at?: string;
  completed_at?: string;
  completion_type?: 'manual' | 'automatic';
  completion_notes?: string;
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