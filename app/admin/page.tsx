'use client';

import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; 
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc,getDoc } from 'firebase/firestore';
import styles from '../styles/AdminPage.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface Booking {
  id: string;
  userId: string;
  accommodationId: string;
  bookingDate: string;

  numberOfNights: number, 
  roomsBooked: number;
}

interface Accommodation {
  id?: string;
  type: string;
  location: string;
  availableRoomsByDate: Record<string, number>;
}

const accommodationTypes = ['Hotel', 'Hostel', 'Apartment', 'Villa', 'Guesthouse'];
const locations = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Dubai', 'Berlin', 'Rome', 'Toronto', 'Mexico City'];

export default function AdminPage() {

  const { user } = useAuth();
  const router = useRouter();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [newAccommodation, setNewAccommodation] = useState<Accommodation>({

    type: '',
    location: '',
    availableRoomsByDate: {}
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [roomsForSelectedDate, setRoomsForSelectedDate] = useState<number>(0);

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'admin') {
      router.push('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    const fetchAccommodations = async () => {
      const accommodationsCollection = collection(db, 'Accommodations');

      const accommodationsSnapshot = await getDocs(accommodationsCollection);
      const accommodationsList = accommodationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Accommodation[];
      setAccommodations(accommodationsList);
    };

    const fetchBookings = async () => {
      const bookingsCollection = collection(db, 'Bookings');

      const bookingsSnapshot = await getDocs(bookingsCollection);
      const bookingsList = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[];
        setBookings(bookingsList);
    };

    fetchAccommodations();

    fetchBookings();
  }, []);

  const handleAddAccommodation = async (e: React.FormEvent) => {
    e.preventDefault();

    await addDoc(collection(db, 'Accommodations'), newAccommodation);
    setNewAccommodation({
      type: '',
      location: '',
      availableRoomsByDate: {}
    });
  };

  const handleAddAvailability = () => {
     if (selectedDate && roomsForSelectedDate > 0) {
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      setNewAccommodation({
        ...newAccommodation,
        availableRoomsByDate: {
          ...newAccommodation.availableRoomsByDate,
          [formattedDate]: roomsForSelectedDate
        }
      });
      setSelectedDate(null);
      setRoomsForSelectedDate(0);
    }
  };

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
  
  
  const handleEditAccommodation = (id: string) => {
    router.push(`/accommodation-admin-edit?id=${id}`);
  };

  const handleEditBooking = (id: string) => {
    router.push(`/edit-booking?id=${id}`); 
  };
  return (
    <div className={styles.adminContainer}>
      <h1 className={styles.adminTitle}>Admin Dashboard</h1>

         <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Add New Accommodation</h2>
        <form onSubmit={handleAddAccommodation} className={styles.accommodationForm}>
          <select
            value={newAccommodation.type}
            onChange={(e) => setNewAccommodation({ ...newAccommodation, type: e.target.value })}
            required
            className={styles.selectField}
          >
            <option value="">Select Type</option>
            {accommodationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={newAccommodation.location}
            onChange={(e) => setNewAccommodation({ ...newAccommodation, location: e.target.value })}
            required
            className={styles.selectField}
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <div className={styles.datePickerContainer}>
            <DatePicker 
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select Date"
              className={styles.datePickerInput}
            />
            <input
              type="number"
              placeholder="Number of Rooms"
              value={roomsForSelectedDate}
              onChange={(e) => setRoomsForSelectedDate(Number(e.target.value))}
              className={styles.inputField}
              required
            />
            <button type="button" onClick={handleAddAvailability} className={styles.addButton}>
              Add Availability
            </button>
          </div>

           <button type="submit" className={styles.submitButton}>Add Accommodation</button>
        </form>

        <div className={styles.availabilitySection}>
          <h3>Current Availability</h3>
          <ul>
            {Object.entries(newAccommodation.availableRoomsByDate).map(([date, rooms]) => (
              <li key={date}>
                {date}: {rooms} rooms
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.listSection}>
        <h2 className={styles.sectionTitle}>Accommodation List</h2>
        <ul className={styles.accommodationList}>
          {accommodations.map(acc => (
            <li key={acc.id} className={styles.listItem}>
              {acc.type} - {acc.location} 
              <button onClick={() => handleEditAccommodation(acc.id || '')} className={styles.editButton}>
                Edit
              </button>
              <ul>
                {Object.entries(acc.availableRoomsByDate).map(([date, rooms]) => (
                  <li key={date}>{date}: {rooms} rooms available</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.listSection}>
        <h2 className={styles.sectionTitle}>Bookings</h2>
        <ul className={styles.bookingList}>
          {bookings.map(booking => (
            <li key={booking.id} className={styles.listItem}>
              <p>User ID: {booking.userId}</p>
              <p>Booking Date: {booking.bookingDate}</p>
              <p>Rooms Booked: {booking.roomsBooked}</p>
              <p>Number of night: {booking.numberOfNights}</p>
           
              <button onClick={() => handleEditBooking(booking.id)} className={styles.editButton}>
                  Edit
                </button>
              <button onClick={() => handleDeleteBooking(booking.id)} className={styles.deleteButton}>
                Delete Booking
              </button>
             </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
