"use client"

import styles from '../styles/HomePage.module.css';
import Link from 'next/link';
import LogoutButton from '../components/LogoutButton'; 
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth(); 

  return (
    <div className={styles.homeContainer}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Welcome to Places To Stay</h1>
        <p className={styles.subtitle}>
          Your go-to platform for booking unique and affordable stays across the globe. 🌍
        </p>
        <Link href="/search">
          <button className={styles.searchButton}>Search Accommodations</button>
        </Link>
      </section>

      <section className={styles.features}>
        <div className={styles.featureItem}>
          <h2>🛏️ Comfortable Stays</h2>
          <p>Explore a wide variety of accommodations including hotels, hostels, campsites, and more.</p>
        </div>
        <div className={styles.featureItem}>
          <h2>📅 Easy Bookings</h2>
          <p>Book rooms effortlessly and track your bookings with our intuitive interface.</p>
        </div>
        <div className={styles.featureItem}>
          <h2>🔒 Secure Payments</h2>
          <p>We ensure your payments are processed securely with the highest standards.</p>
        </div>
      </section>

      <section className={styles.promo}>
        <h3>🏖️ Looking for summer getaways?</h3>
        <p>Discover special deals for summer vacation rentals. Hurry, limited rooms available!</p>
        <Link href="/deals">
          <button className={styles.promoButton}>Explore Deals</button>
        </Link>
      </section>

      {user && ( 
        <section className={styles.logoutSection}>
          <LogoutButton />
        </section>
      )}
    </div>
  );
}
