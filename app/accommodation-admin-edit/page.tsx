'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import styles from '../styles/AdminEditPage.module.css';

interface Accommodation {
  id: string;
  type: string;
  location: string;
  availableRoomsByDate: Record<string, number>;
}

const accommodationTypes = ['Hotel', 'Hostel', 'Apartment', 'Villa', 'Guesthouse'];
const locations = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Dubai', 'Berlin', 'Rome', 'Toronto', 'Mexico City'];

const AccommodationAdminEdit = () => {
  const router = useRouter();
  const [accommodationId, setAccommodationId] = useState<string>('');
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [error, setError] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [availableRoomsByDate, setAvailableRoomsByDate] = useState<Record<string, number>>({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || '';
    setAccommodationId(id);
    
    const fetchAccommodation = async () => {
      try {
        const docRef = doc(db, 'Accommodations', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Accommodation;
          setAccommodation(data);
          setType(data.type);
          setLocation(data.location);
          setAvailableRoomsByDate(data.availableRoomsByDate);
        } else {
          setError('Accommodation not found.');
        }
      } catch (err) {
        console.error('Error fetching accommodation: ', err);
        setError('Failed to fetch accommodation details.');
      }
    };

    fetchAccommodation();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accommodationId) return;

    try {
      const updatedAccommodation = {
        type,
        location,
        availableRoomsByDate,
      };

      await updateDoc(doc(db, 'Accommodations', accommodationId), updatedAccommodation);
      router.push('/admin'); 
    } catch (err) {
      console.error('Error updating accommodation: ', err);
      setError('Failed to update accommodation.');
    }
  };

  const handleDelete = async () => {
    if (!accommodationId || !window.confirm('Are you sure you want to delete this accommodation?')) return;

    try {
      await deleteDoc(doc(db, 'Accommodations', accommodationId));
      router.push('/admin'); 
    } catch (err) {
      console.error('Error deleting accommodation: ', err);
      setError('Failed to delete accommodation.');
    }
  };

  return (
    <div className={styles.editContainer}>
      <h1>Edit Accommodation</h1>

      {error && <p className={styles.error}>{error}</p>}

      {accommodation ? (
        <form className={styles.editForm} onSubmit={handleUpdate}>
          <div className={styles.formGroup}>
            <label>Accommodation Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className={styles.editInput}
            >
              <option value="">Select Type</option>
              {accommodationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Location:</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className={styles.editInput}
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Available Rooms by Date:</label>
            <textarea
              value={JSON.stringify(availableRoomsByDate, null, 2)}
              onChange={(e) => setAvailableRoomsByDate(JSON.parse(e.target.value))}
              required
              className={styles.editInput}
            />
              <small className={styles.small}>Format: {"{\"YYYY-MM-DD\": number}"}</small>
          </div>

          <button type="submit" className={styles.updateButton}>Update</button>
          
          <button type="button" className={styles.deleteButton} onClick={handleDelete}>Delete</button>
        </form>
      ) : (

        <p className={styles.error}> Accommodation not found.</p>
      )}
    </div>
  );
};

export default AccommodationAdminEdit;
