'use client';

import { useState } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
import styles from '../styles/SearchPage.module.css'; 
import Link from 'next/link'; 
import { FaHotel, FaMapMarkerAlt, FaBed, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth'; 

interface Accommodation {
  id: string;
  accommodationId: string;

  type: string;
  location: string;
  availableRoomsByDate: Record<string, number>;  
}

const accommodationTypes = ['Hotel', 'Hostel', 'Apartment', 'Villa', 'Guesthouse'];
const locations = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Dubai', 'Berlin', 'Rome', 'Toronto', 'Mexico City']; 

export default function SearchPage() {
  
  const { user } = useAuth(); 
  
  const router = useRouter();
  const [type, setType] = useState<string>('');

  const [location, setLocation] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(''); 
  const [numberOfNights, setNumberOfNights] = useState<number>(1); 
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null); 

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAccommodations([]); 
  
    try {
      const accommodationsRef = collection(db, 'Accommodations');
      const q = query(
        accommodationsRef,
        where('type', '==', type),
        where('location', '==', location)
      );


  
         const querySnapshot = await getDocs(q);
      const results: Accommodation[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Accommodation[];

      console.log(results);
  
      const filteredResults = results.filter(acc => {
        let isAvailable = true;
        console.log(acc);
  
        for (let i = 0; i < numberOfNights; i++) {
          const nextDate = new Date(selectedDate);
          console.log(nextDate);
          nextDate.setDate(nextDate.getDate() + i);
          const dateString = nextDate.toISOString().split('T')[0]; 
          
            const availableRoomsOnDate = acc.availableRoomsByDate[dateString];
          console.log(availableRoomsOnDate);
              console.log(dateString);
          if (!availableRoomsOnDate || availableRoomsOnDate < availableRooms) {
            isAvailable = false;
            break;
          }
        }
  
        return isAvailable;
      });
  
      if (filteredResults.length === 0) {
        setError('No accommodations found for the selected dates and availability.');
      } else {
        setAccommodations(filteredResults);
      }
    } catch (err) {
      console.error('Error searching accommodations: ', err);
      setError('Failed to fetch accommodations. Please try again.');
    }
  };
  

  const handleBooking = async (accommodation: Accommodation) => {
    console.log(accommodation, !user?.email);
    if (!accommodation || !user?.email) {
      setError('User not authenticated or accommodation not selected.');
      return;
    }
  
    const bookingDate = new Date(selectedDate);
    const bookingDateString = bookingDate.toISOString().split('T')[0];
  
    try {
      const booking = {
        userId: user.email,

        bookingDate: bookingDateString,
        roomsBooked: availableRooms,
        numberOfNights: numberOfNights, 
        accommodationId: accommodation.id,
      };
  
      await addDoc(collection(db, 'Bookings'), booking);
  
      for (let i = 0; i < numberOfNights; i++) {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + i);

        const dateString = nextDate.toISOString().split('T')[0];
        const availableRoomsOnDate = accommodation.availableRoomsByDate[dateString] || 0;
        if (availableRoomsOnDate >= availableRooms) {

          await updateDoc(doc(db, 'Accommodations', accommodation.id), {
            [`availableRoomsByDate.${dateString}`]: availableRoomsOnDate - availableRooms,
          });
        } else {
          throw new Error('Not enough available rooms for the selected dates.');
        }
      }
  
      router.push('/success');
    } catch (err) {
      console.error('Error during booking: ', err);
      setError('Failed to complete the booking. Please try again.');
    }
  };
  
  
  

  return (
    <div className={styles.searchContainer}>
      <h1>Search Accommodations</h1>
  
      <div className={styles.statsSection}>

        <div className={styles.statItem}>
          <FaHotel size={30} className={styles.icon} /> 
          <p>Total Accommodations: {21}</p>
        </div>
        <div className={styles.statItem}>
          <FaBed size={30} className={styles.icon} />
          <p>Total Available Rooms: {41}</p>
        </div>
        <div className={styles.statItem}>
          <FaUsers size={30} className={styles.icon} />
          <p>User Ratings: {4.7} / 5</p>
        </div>
      </div>

  
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.formGroup}>
          <label>Accommodation Type:</label>
          <div className={styles.selectWithIcon}>
            <FaHotel size={20} className={styles.icon} />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className={styles.searchInput}
            >
              <option value="">Select Type</option>
              {accommodationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
  
        <div className={styles.formGroup}>
          <label>Location:</label>

          <div className={styles.selectWithIcon}>
            <FaMapMarkerAlt size={20} className={styles.icon} /> 
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className={styles.searchInput}
            >

              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
  
        <div className={styles.formGroup}>

          <label>Minimum Available Rooms:</label>
          
          <div className={styles.inputWithIcon}>
            <FaBed size={20} className={styles.icon} /> 
            <input
              type="number"
              value={availableRooms}
              onChange={(e) => setAvailableRooms(Number(e.target.value))}
              min="1"
              className={styles.searchInput}
              required
            />
          </div>
        </div>
  
        <div className={styles.formGroup}>
          <label>Select Date:</label>

          <div className={styles.inputWithIcon}>
            <FaCalendarAlt size={20} className={styles.icon} /> 
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className={styles.searchInput}
            />
          </div>
        </div>
  
        <div className={styles.formGroup}>
          <label>Number of Nights:</label>
          <div className={styles.inputWithIcon}>
            <FaCalendarAlt size={20} className={styles.icon} />
            <input
              type="number"
              value={numberOfNights}
              onChange={(e) => setNumberOfNights(Number(e.target.value))}
              min="1"
              className={styles.searchInput}
              required
            />
          </div>
        </div>
  
        <button type="submit" className={styles.searchButton}>Search</button>
      </form>
  
      {error && <p className={styles.error}>{error}</p>}
  
      <div className={styles.resultsContainer}>
        {accommodations.length > 0 && (
          <ul>
            {accommodations.map((acc) => (
              <li key={acc.id}>
                <Link href={`/booking/${acc.id}`} className={styles.bookingLink}>
                  <FaHotel className={styles.icon} /> {acc.type} - <FaMapMarkerAlt className={styles.icon} /> {acc.location} 
                  ({availableRooms} rooms available from {selectedDate} for {numberOfNights} nights)
                </Link>
                <button 
                
                  className={styles.bookButton} 
                  onClick={async () => {
                    await handleBooking(acc); 
                  }}
                >
                  Book Now
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}