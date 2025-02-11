export interface TimeSlot {
  date: string;
  time: string;
  tutorId: string;
  studentId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// You can also move other booking-related interfaces here
export interface Booking extends TimeSlot {
  id: string;
  tutorName: string;
  price: number;
  paymentMethod: string;
}