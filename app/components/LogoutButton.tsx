"use client"

import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useRouter } from 'next/navigation';
import styles from '../styles/LogoutButton.module.css';
export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); 
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <button className={styles.logoutButton} onClick={handleLogout}>
      Logout
    </button>
  );
}
