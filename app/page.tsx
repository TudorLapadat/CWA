
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebaseConfig'; 
import styles from './styles/LoginPage.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDoc, doc } from 'firebase/firestore';

export default function LoginPage() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'Users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        sessionStorage.setItem('userRole', userData.role);
        sessionStorage.setItem('userEmail', user.email  || '');
        
        if (userData.role === 'admin') {
          router.push('/admin'); 
        } else {
          router.push('/dashboard'); 
        }
      }

    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    }
  };


  return (
    <div className={styles.loginContainer}>
      <h1>Login</h1>

      <form className={styles.loginForm} onSubmit={handleLogin}>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Password:</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
            placeholder="Enter your password"
            required
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.loginButton}>
          Login
        </button>
      </form>

      <p className={styles.signupText}>

        Don't have an account?{' '}
        <Link href="/signup">
          <button className={styles.signupButton}>Sign Up</button>
        </Link>
      </p>
    </div>
  );
}
