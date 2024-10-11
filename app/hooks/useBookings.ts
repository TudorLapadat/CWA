import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface Booking {

  id?: string;
  userId: string;
  accommodationId: string;
  bookingDate: string;
  roomsBooked: number;
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const bookingsCollection = collection(db, 'Bookings');
      
      const bookingsSnapshot = await getDocs(bookingsCollection);
      const bookingsList = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[];
      setBookings(bookingsList);
    };

    fetchBookings();
  }, []);

  const addBooking = async (newBooking: Booking) => {

    await addDoc(collection(db, 'Bookings'), newBooking);
  };

  const deleteBooking = async (id: string) => {
    await deleteDoc(doc(db, 'Bookings', id));
    setBookings(bookings.filter(booking => booking.id !== id));
  };

  return { bookings, addBooking, deleteBooking };
};
