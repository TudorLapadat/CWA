

import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Places To Stay',
  description: 'Find and book the best places to stay anywhere in the world!',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">

      <body>
        <header>
          <nav className="navbar">
            
            <div className="logo">PlacesToStay</div>
            <ul className="nav-links">
              <li><a href="/dashboard">Home</a></li>
              <li><a href="/search">Search</a></li>
              <li><a href="/bookings">Bookings</a></li>
            </ul>
          </nav>
        </header>
        <main className="content">{children}</main>
        <footer>
          <p>© 2024 Places To Stay. Crafted with care. 🌍✨</p>
        </footer>
      </body>
    </html>
  );
}
