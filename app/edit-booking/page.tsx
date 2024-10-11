'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
import styles from '../styles/EditBookingPage.module.css'; 
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth'; 

interface Booking {
  id: string;
  userId: string;
  accommodationId: string;
  bookingDate: string;
  numberOfNights: number;
  roomsBooked: number;

}


interface Accommodation {
  id: string; 

  type: string;
  location: string;
  availableRoomsByDate: Record<string, number>;
}

const EditBooking = () => {
  const { user } = useAuth();
  const router = useRouter();
  const bookingId = new URLSearchParams(window.location.search).get('id');

  const [booking, setBooking] = useState<Booking | null>(null);

  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [numberOfNights, setNumberOfNights] = useState<number>(1);

  const [availableRooms, setAvailableRooms] = useState<number>(1);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchBooking = async () => {
      if (bookingId) {
        const bookingDoc = doc(db, 'Bookings', bookingId);
        const bookingSnapshot = await getDoc(bookingDoc);
        if (bookingSnapshot.exists()) {
          const bookingData = bookingSnapshot.data() as Booking;
          setBooking(bookingData);
          setNumberOfNights(bookingData.numberOfNights);
          setAvailableRooms(bookingData.roomsBooked);
          
          const accommodationDoc = doc(db, 'Accommodations', bookingData.accommodationId);
          const accommodationSnapshot = await getDoc(accommodationDoc);
          if (accommodationSnapshot.exists()) {
            const accommodationData = accommodationSnapshot.data() as Accommodation;
            setAccommodation({ ...accommodationData, id: accommodationSnapshot.id });
          }
        }
      } 
    };
    fetchBooking();
  }, [bookingId]);
  
  const handleUpdateBooking = async () => {
    if (!booking || !accommodation || !user?.email) {
      setError('User not authenticated or booking not found.');
      return;
    }

    const bookingDate = new Date(booking.bookingDate);
    
    try {
      for (let i = 0; i < numberOfNights; i++) {
        const nextDate = new Date(bookingDate);
        nextDate.setDate(nextDate.getDate() + i);
        const dateString = nextDate.toISOString().split('T')[0];
    
        let availableRoomsOnDate = accommodation.availableRoomsByDate.hasOwnProperty(dateString) 
            ? accommodation.availableRoomsByDate[dateString] 
            : undefined;

            if (availableRoomsOnDate === undefined) {
              setError(`Booking for ${dateString} not available.`);
              throw new Error(`Booking for ${dateString} not available.`);
          } else {
              console.log(`Available rooms on ${dateString}: ${availableRoomsOnDate}`);
          }
    
        console.log(availableRoomsOnDate);
        availableRoomsOnDate = availableRoomsOnDate + booking.roomsBooked;
        
        if (availableRoomsOnDate < availableRooms) {
          setError('Not enough available rooms for the selected dates.');
          throw new Error('Not enough available rooms for the selected dates.');
          
        }
      }


      const accommodationRef = doc(db, 'Accommodations', booking.accommodationId);
      let accommodationSnapshot = await getDoc(accommodationRef);
      
      if (accommodationSnapshot.exists()) {
        let accommodationData = accommodationSnapshot.data() as Accommodation;
        const bookingDate = booking.bookingDate;
      
        for (let i = 0; i < booking.numberOfNights; i++) {
          const nextDate = new Date(bookingDate);
          nextDate.setDate(nextDate.getDate() + i);
          const dateString = nextDate.toISOString().split('T')[0]; 
      
          const currentAvailableRooms = accommodationData.availableRoomsByDate[dateString] || 0;
          console.log(dateString);
          console.log(currentAvailableRooms + booking.roomsBooked);
      
          await updateDoc(accommodationRef, {
            [`availableRoomsByDate.${dateString}`]: currentAvailableRooms + booking.roomsBooked,
          });
      
          console.log(`Updated available rooms for date ${dateString}: ${currentAvailableRooms + booking.roomsBooked}`);
        }
      
        accommodationSnapshot = await getDoc(accommodationRef);
        accommodationData = accommodationSnapshot.data() as Accommodation;
      
        const updatedBooking = {
          ...booking,
          numberOfNights,
          roomsBooked: availableRooms,
        };
      
        console.log("Updated booking");
        console.log(updatedBooking);
      
        if (bookingId) {
          await updateDoc(doc(db, 'Bookings', bookingId), updatedBooking);
      
          for (let i = 0; i < numberOfNights; i++) {
            const nextDate = new Date(bookingDate);
            nextDate.setDate(nextDate.getDate() + i);
            const dateString = nextDate.toISOString().split('T')[0];
      
            console.log("Refetched accommodation data for date", dateString);
            const updatedAvailableRooms = accommodationData.availableRoomsByDate[dateString] || 0;
            console.log("Available rooms after refetch:", updatedAvailableRooms);
      
            await updateDoc(accommodationRef, {
              [`availableRoomsByDate.${dateString}`]: updatedAvailableRooms - availableRooms,
            });
      
            console.log(`Final update to available rooms for date ${dateString}: ${updatedAvailableRooms - availableRooms}`);
          }
        } else {
          setError('Booking ID is not valid.');
        }
      } else {
        console.error('Accommodation not found for ID:', booking.accommodationId);
      }
      
      router.push('/success');
    } catch (err) {
      console.error('Error updating booking: ', err);
    }
  };

  return (
    <div className={styles.editContainer}>
      <h1 className={styles.title}>Edit Booking</h1>
      {error && <p className={styles.error}>{error}</p>}
      {booking && accommodation ? (
        <div className={styles.bookingDetails}>
          <p className={styles.accommodationInfo}>
            Accommodation: {accommodation.type} - {accommodation.location}
          </p>
          <p className={styles.currentBookingInfo}>
            Current Booking Date: {booking.bookingDate}
          </p>
          <p className={styles.currentBookingInfo}>
            Current Number of Nights: {booking.numberOfNights}
          </p>
          <p className={styles.currentBookingInfo}>
            Rooms Booked: {booking.roomsBooked}
          </p>

          <label className={styles.label}>Number of Nights:</label>
          <input
            type="number"
            value={numberOfNights}
            onChange={(e) => setNumberOfNights(Number(e.target.value))}
            min="1"
            required
            className={styles.input}
          />
          <label className={styles.label}>Rooms Booked:</label>
          <input
            type="number"
            value={availableRooms}
            onChange={(e) => setAvailableRooms(Number(e.target.value))}
            min="1"
            required
            className={styles.input}
          />

          <button onClick={handleUpdateBooking} className={styles.updateButton}>
            Update Booking
          </button>
        </div>
      ) : (
        <p>Loading booking details...</p>
      )}
    </div>
  );
};

export default EditBooking;
