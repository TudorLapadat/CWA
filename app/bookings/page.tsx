'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { FaEdit, FaTrash } from 'react-icons/fa'; 
import styles from '../styles/BookingPage.module.css';


interface Booking {
  id: string;
  userId: string;
  accommodationId: string;
  numberOfNights: number, 

  bookingDate: string;
  roomsBooked: number;
}

interface Accommodation {

  id?: string;
  type: string;
  location: string;
  availableRoomsByDate: Record<string, number>;
}
const UserBookings = () => {

  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
          const bookingsCollection = collection(db, 'Bookings');
        const bookingSnapshot = await getDocs(bookingsCollection);
        const bookingList: Booking[] = bookingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Booking[];
        
        setBookings(bookingList);
      } catch (err) {

        console.error('Error fetching bookings:', err);
        setError('Failed to fetch bookings.');
      }
    };

    fetchBookings();
  }, []);

  const handleDeleteBooking = async (id: string) => {
    try {
      console.log(`Attempting to delete booking with ID: ${id}`);
  
      const bookingDoc = doc(db, 'Bookings', id);
      const bookingSnapshot = await getDoc(bookingDoc);
  
      if (bookingSnapshot.exists()) {
        const bookingData = bookingSnapshot.data() as Booking;
        
        const accommodationRef = doc(db, 'Accommodations', bookingData.accommodationId);
        const accommodationSnapshot = await getDoc(accommodationRef);
        
        if (accommodationSnapshot.exists()) {
          const accommodationData = accommodationSnapshot.data() as Accommodation;
          const bookingDate = bookingData.bookingDate;
  
          for (let i = 0; i < bookingData.numberOfNights; i++) {
            const nextDate = new Date(bookingDate);
            nextDate.setDate(nextDate.getDate() + i);
            const dateString = nextDate.toISOString().split('T')[0]; 
  
            const currentAvailableRooms = accommodationData.availableRoomsByDate[dateString] || 0;
            await updateDoc(accommodationRef, {
              [`availableRoomsByDate.${dateString}`]: currentAvailableRooms + bookingData.roomsBooked,
            });
  

            console.log(`Updated available rooms for date ${dateString}: ${currentAvailableRooms + bookingData.roomsBooked}`);
          }
        } else {
          console.error('Accommodation not found for ID:', bookingData.accommodationId);
        }
        

        await deleteDoc(bookingDoc);
        setBookings(bookings.filter(booking => booking.id !== id));
        console.log(`Booking with ID: ${id} deleted successfully.`);
      } else {

        console.error('Booking does not exist for ID:', id);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleEditBooking = (id: string) => {
    router.push(`/edit-booking?id=${id}`); 
  };


  return (
    <div className={styles.bookingsContainer}>
      <h1 className={styles.h1}>Your Bookings</h1>

      {error && <p className={styles.error}>{error}</p>}

      {bookings.length > 0 ? (
        <ul className={styles.bookingsList}>
          {bookings.map((booking) => (
            <li key={booking.id} className={styles.bookingItem}>
              <div>
                <p>Accommodation ID: {booking.accommodationId}</p>
                <p>Booking Date: {booking.bookingDate}</p>
                <p>Rooms Booked: {booking.roomsBooked}</p>
              </div>

              <div className={styles.buttons}>
                <button onClick={() => handleEditBooking(booking.id)} className={styles.editButton}>
                  <FaEdit className={styles.icon} /> Edit
                </button>
                <button onClick={() => handleDeleteBooking(booking.id)} className={styles.cancelButton}>
                  <FaTrash className={styles.icon} /> Cancel
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (

        <p>No bookings found.</p>
      )}
    </div>
  );
};

export default UserBookings;
