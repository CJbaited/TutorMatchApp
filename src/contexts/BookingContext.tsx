import React, { createContext, useContext, useState } from 'react';
import { Booking } from '../types/booking';

/*type Booking = {
  id: string;
  tutorId: string;
  tutorName: string;
  date: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentMethod: string;
};*/

type BookingContextType = {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  cancelBooking: (id: string) => void;
  getBookingsByStatus: (status: Booking['status']) => Booking[];
};

const BookingContext = createContext<BookingContextType | null>(null);

export const BookingProvider: React.FC = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const addBooking = (bookingData: Omit<Booking, 'id' | 'status'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      status: 'pending',
    };
    setBookings([...bookings, newBooking]);
  };

  const cancelBooking = (id: string) => {
    setBookings(bookings.map(booking => 
      booking.id === id 
        ? { ...booking, status: 'cancelled' } 
        : booking
    ));
  };

  const getBookingsByStatus = (status: Booking['status']) => {
    return bookings.filter(booking => booking.status === status);
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      addBooking,
      cancelBooking,
      getBookingsByStatus,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
};
