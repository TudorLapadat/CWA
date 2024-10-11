'use client';

import { useRouter } from 'next/navigation';
import styles from '../styles/SuccessPage.module.css';

export default function SuccessPage() {
  const router = useRouter();

  const handleHomeRedirect = () => {
    router.push('/dashboard'); 
  };


  return (
    <div className={styles.successContainer}>
      <h1>Booking Successful!</h1>
      
      <p>Your booking has been confirmed. Thank you for choosing us!</p>
      <div className={styles.buttonContainer}>
        <button className={styles.homeButton} onClick={handleHomeRedirect}>
          Go to Home
        </button>
      </div>
    </div>
  );
}
