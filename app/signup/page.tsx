'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; 
import styles from '../styles/SignupPage.module.css';
import { useRouter } from 'next/navigation';
import { setDoc, doc } from 'firebase/firestore';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user'); 
  const [adminCode, setAdminCode] = useState(''); 
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (role === 'admin' && adminCode !== '123') {
        setError('Incorrect admin creation code.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'Users', user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date()
      });

      sessionStorage.setItem('userRole', role);
      sessionStorage.setItem('userEmail', user.email || '');

      if (role === 'admin') {
        router.push('/admin'); 
      } else {
        router.push('/dashboard'); 
      }

    } catch (err) {
      setError('Failed to sign up. Please try again.');
    }
  };

  return (
    <div className={styles.signupContainer}>
      <h1 className={styles.signupHeading}>Sign Up</h1>
      <form className={styles.signupForm} onSubmit={handleSignup}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email:</label>
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
          <label className={styles.formLabel}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
            className={styles.inputField}
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role === 'admin' && (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Admin Code:</label>
            <input
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className={styles.inputField}
              placeholder="Enter admin creation code"
            />
          </div>
        )}

        {error && <p className={styles.errorMessage}>{error}</p>}

        <button type="submit" className={styles.signupButton}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
